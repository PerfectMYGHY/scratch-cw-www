const React = require('react');
const Thumbnail = require('../../components/thumbnail/thumbnail.jsx');
const Button = require('../../components/forms/button.jsx');

import PropTypes from 'prop-types';

require('./ProjectsList.scss');

const ProjectInfo = ({item, canRemove, canTake, text, onClick, onGetMore}) => {
    let mt = new Date(item.history.modified);
    // 获取年份、月份和日期
    const year = mt.getFullYear(); // 获取年份（四位数）
    const month = (`0${mt.getMonth() + 1}`).slice(-2); // 获取月份（补零）
    const day = (`0${mt.getDate()}`).slice(-2); // 获取日期（补零）

    // 拼接成所需格式的字符串
    mt = `${year}-${month}-${day}`;
    return (
        <div info="info">
            <a
                className="thumbnail-image"
                href={`/projects/${item.id}/`}
                key="imgElement"
                target="_blank"
                rel="noreferrer"
            >
                <img
                    alt={item.title}
                    src={item.image}
                />
            </a>
            <div className="info">
                <a
                    href={`/projects/${item.id}/`}
                    target="_blank"
                    rel="noreferrer"
                >{item.title}</a>
                <p>最后修改日期：{mt}</p>
                <Button
                    onClick={() => {
                        window.open(`/projects/${item.id}/editor`, '_blank');
                    }}
                >
                    打开编辑器页面
                </Button>
            </div>
            <div className="right-top">
                <a
                    onClick={() => {
                        if (onClick){
                            onClick(item.id);
                        }
                    }}
                >
                    {canRemove && '删除'}
                    {canTake && '恢复'}
                    {text && text}
                </a>
                <br />
                {onGetMore(item.id, item)}
                <br />
                {item.public && (item.looked && !item.passed ? (
                    <span className="not-passed">
                        未通过审核！
                    </span>
                ) : (item.looked ? (
                    <span className="passed">
                        审核通过！
                    </span>
                ) : (
                    <span className="not-checked">
                        还未审核
                    </span>
                )))}
            </div>
        </div>
    );
};

ProjectInfo.propTypes = {
    item: PropTypes.shape({
        id: PropTypes.number,
        title: PropTypes.string,
        description: PropTypes.string,
        instructions: PropTypes.string,
        visibility: PropTypes.string,
        public: PropTypes.bool,
        comments_allowed: PropTypes.bool,
        is_published: PropTypes.bool,
        author: PropTypes.shape({
            id: PropTypes.number,
            username: PropTypes.string,
            scratchteam: PropTypes.bool,
            email: PropTypes.string,
            profile: PropTypes.shape({
                id: PropTypes.number,
                images: PropTypes.objectOf(PropTypes.string)
            })
        }),
        image: PropTypes.string,
        images: PropTypes.objectOf(PropTypes.string),
        history: PropTypes.shape({
            created: PropTypes.string,
            modified: PropTypes.string,
            shared: PropTypes.string
        }),
        stats: PropTypes.shape({
            views: PropTypes.number,
            loves: PropTypes.number,
            favorites: PropTypes.number,
            remixes: PropTypes.number,
            passed: PropTypes.bool
        }),
        passed: PropTypes.bool,
        type: PropTypes.string,
        quality: PropTypes.string,
        added: PropTypes.number,
        looked: PropTypes.bool,
        liked: PropTypes.bool,
        liked_project: PropTypes.number,
        remix: PropTypes.shape({
            parent: PropTypes.number,
            root: PropTypes.number
        }),
        project_token: PropTypes.string,
        featured: PropTypes.bool
    }),
    canRemove: PropTypes.bool,
    canTake: PropTypes.bool,
    text: PropTypes.string,
    onClick: PropTypes.func,
    onGetMore: PropTypes.func
};

const ProjectsList = ({items, canRemove, canTake, text, onClick, onGetMore}) => (<div className="projects-list">
    {items.map(item => (<ProjectInfo
        item={item}
        canRemove={canRemove}
        canTake={canTake}
        text={text}
        onClick={onClick}
        onGetMore={onGetMore}
        key={`PROJECT_${text}_${item.id}`}
    />))}
</div>);

ProjectsList.propTypes = {
    items: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.number,
        title: PropTypes.string,
        description: PropTypes.string,
        instructions: PropTypes.string,
        visibility: PropTypes.string,
        public: PropTypes.bool,
        comments_allowed: PropTypes.bool,
        is_published: PropTypes.bool,
        author: PropTypes.shape({
            id: PropTypes.number,
            username: PropTypes.string,
            scratchteam: PropTypes.bool,
            email: PropTypes.string,
            profile: PropTypes.shape({
                id: PropTypes.number,
                images: PropTypes.objectOf(PropTypes.string)
            })
        }),
        image: PropTypes.string,
        images: PropTypes.objectOf(PropTypes.string),
        history: PropTypes.shape({
            created: PropTypes.string,
            modified: PropTypes.string,
            shared: PropTypes.string
        }),
        stats: PropTypes.shape({
            views: PropTypes.number,
            loves: PropTypes.number,
            favorites: PropTypes.number,
            remixes: PropTypes.number,
            passed: PropTypes.bool
        }),
        passed: PropTypes.bool,
        type: PropTypes.string,
        quality: PropTypes.string,
        added: PropTypes.number,
        looked: PropTypes.bool,
        liked: PropTypes.bool,
        liked_project: PropTypes.number,
        remix: PropTypes.shape({
            parent: PropTypes.number,
            root: PropTypes.number
        }),
        project_token: PropTypes.string,
        featured: PropTypes.bool
    })),
    canRemove: PropTypes.bool,
    canTake: PropTypes.bool,
    text: PropTypes.string,
    onClick: PropTypes.func,
    onGetMore: PropTypes.func
};

module.exports = ProjectsList;
