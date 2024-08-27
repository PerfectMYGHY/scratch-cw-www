const React = require('react');
const Thumbnail = require('../../components/thumbnail/thumbnail.jsx');
const Button = require('../../components/forms/button.jsx');

require('./ReportsList.scss');

const ReportInfo = ({item,canRemove,canTake,text,onClick,more,getChildren,btnt}) => {
    var mt = new Date(item.modified_time);
    // 获取年份、月份和日期
    let year = mt.getFullYear(); // 获取年份（四位数）
    let month = ('0' + (mt.getMonth() + 1)).slice(-2); // 获取月份（补零）
    let day = ('0' + mt.getDate()).slice(-2); // 获取日期（补零）

    // 拼接成所需格式的字符串
    mt = `${year}-${month}-${day}`;
    return (
        <div info="info">
            {
                item.project &&
                <a
                    className="thumbnail-image"
                    href={`/projects/${item.body.project}/`}
                    key="imgElement"
                    target="_blank"
                >
                    <img
                        alt={item.project.title}
                        src={item.project.image}
                    />
                </a>
            }
            {
                item.project ? <div class="info narrow">
                    <a href={`/projects/${item.project.id}/`} target="_blank">{item.project.title}</a>
                    <p>最后修改日期：{mt}</p>
                    <Button onClick={()=>{
                        window.open(`/projects/${item.project.id}/editor`, '_blank');
                    }}>
                        打开编辑器页面
                    </Button>
                </div> : <div class="info wide">
                        <p>来自：<a href={`/projects/${item.body.project}/`} target="_blank">{item.p_title}</a></p>
                        <p>内容：{item.body.content}</p>
                        <p>
                            作者：<a href={`/users/${item.u_info.user.username}/`}>{item.u_info.user.username}</a>
                        </p>
                        <p>
                            举报者：<a href={`/users/${item.sendfrom_info.user.username}/`}>{item.sendfrom_info.user.username}</a>
                        </p>
                </div>
            }
            <div class="right-top">
                <a onClick={()=>{
                    if (onClick){
                        onClick((item.project ? item.project.id : item.body.project), !item.project && item.body.cid, item.id);
                    }
                }}>
                    {canRemove && (btnt || "删除")}
                    {canTake && "恢复"}
                    {text && text}
                </a>
                <br />
                {item.project ? more(item.project.id, item.project, null, item.id) : more(item.body.project, item, !item.project && item.body.cid, item.id)}
            </div>
            {
                getChildren && <div class="children">
                    {getChildren && getChildren(item.project.id, item.project, item)}
                </div>
            }
        </div>
    )
}

const ReportsList = ({ items, canRemove, canTake, text, onClick, more, getChildren, btnt }) => {
    return (<div class="reports-list">
        {items.map((item) => <ReportInfo item={item} canRemove={canRemove} canTake={canTake} text={text} onClick={onClick} more={more} getChildren={getChildren} btnt={btnt}></ReportInfo>)}
    </div>);
};

module.exports = ReportsList;
