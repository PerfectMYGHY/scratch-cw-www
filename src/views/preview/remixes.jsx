// 显示所有的该项目的改编作品

const React = require('react');
const Page = require('../../components/page/www/page.jsx');
const render = require('../../lib/render.jsx');
const Thumbnail = require('../../components/thumbnail/thumbnail.jsx');
const thumbnailUrl = require('../../lib/user-thumbnail');
const ThumbnailColumn = require('../../components/thumbnailcolumn/thumbnailcolumn.jsx');
const Cookies = require("js-cookie");
const Button = require('../../components/forms/button.jsx');

require("./remixes.scss");

class Remixes extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            length: 0,
            loaded: false,
            project: null,
            remixes: [],
            error: false,
            end:false,
        };
        this.load();
    }

    onerror = (err) => {
        this.setState({
            error: true
        });
        throw err;
    }

    load = async (offset=0,limit=10) => {
        const id = window.location.pathname.split("/")[2];
        let p_data = await fetch(`${process.env.PROJECT_HOST}/projects/${id}`, {
            headers: {
                user: Cookies.get("user"),
            }
        }).then((response) => response.json()).catch(this.onerror);
        let r_data = await fetch(`${process.env.PROJECT_HOST}/projects/${id}/remixes?offset=${offset}&limit=${limit}`).then((response) => response.json()).catch(this.onerror);
        this.setState({
            project: p_data,
            remixes: this.state.remixes.concat(r_data),
            loaded: true,
            length: this.state.remixes.length + r_data.length,
        });
        if (r_data.length < limit - offset) {
            this.setState({
                end: true
            });
        }
    }

    loadMore = () => {
        this.load(this.state.length, this.state.length + 10);
    }

    render() {
        return (
            <Page>
                <div>
                    {this.state.error ? (
                        <p>糟糕！加载时出错了，如果您是开发者，请查看控制台；如果您是普通用户，请报告给开发者。</p>
                    ) : (
                        !this.state.loaded ? (
                            <h1>正在加载...</h1>
                        ) : (
                            <>
                                <div className="root-project">
                                    <Thumbnail
                                        avatar={thumbnailUrl(this.state.project.author.id)}
                                        creator={this.state.project.author.username}
                                        favorites={this.state.project.stats.favorites}
                                        href={`/projects/${this.state.project.id}/`}
                                        key={"project_root"}
                                        loves={this.state.project.stats.loves}
                                        remixes={this.state.project.stats.remixes}
                                        showAvatar={true}
                                        showFavorites={true}
                                        showLoves={true}
                                        showRemixes={true}
                                        showViews={true}
                                        src={this.state.project.image}
                                        title={this.state.project.title}
                                        type={'project'}
                                        views={this.state.project.stats.views}
                                    ></Thumbnail>
                                    <div className="root-project-title"><a href={`/projects/${this.state.project.id}/`}>{this.state.project.title}</a></div>
                                    <div className="root-project-author">by <a href={`/users/${this.state.project.author.username}/`}>{this.state.project.author.username}</a></div>
                                </div>
                                <hr />
                                <h1 className="title">所有的改编项目</h1>
                                <ThumbnailColumn
                                    cards
                                    showAvatar
                                    itemType="projects"
                                    items={this.state.remixes}
                                    showFavorites={true}
                                    showLoves={true}
                                    showViews={true}
                                    showRemixes={true}
                                />
                                {
                                    !this.state.end && (
                                        <p className="load-more">
                                            <Button onClick={this.loadMore}>
                                                更多
                                            </Button>
                                        </p>
                                    )
                                }
                            </>
                        )
                    )}
                </div>
            </Page>
        );
    }
}

render(<Remixes />, document.getElementById('app'));