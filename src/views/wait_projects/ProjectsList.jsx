const React = require('react');
const Thumbnail = require('../../components/thumbnail/thumbnail.jsx');
const Button = require('../../components/forms/button.jsx');

require('./ProjectsList.scss');

const ProjectInfo = ({item,canRemove,canTake,text,onClick,more,getChildren}) => {
    var mt = new Date(item.history.modified);
    // 获取年份、月份和日期
    let year = mt.getFullYear(); // 获取年份（四位数）
    let month = ('0' + (mt.getMonth() + 1)).slice(-2); // 获取月份（补零）
    let day = ('0' + mt.getDate()).slice(-2); // 获取日期（补零）

    // 拼接成所需格式的字符串
    mt = `${year}-${month}-${day}`;
    return (
        <div info="info">
            <a
                className="thumbnail-image"
                href={`/projects/${item.id}/`}
                key="imgElement"
                target="_blank"
            >
                <img
                    alt={item.title}
                    src={item.image}
                />
            </a>
            <div class="info">
                <a href={`/projects/${item.id}/`} target="_blank">{item.title}</a>
                <p>最后修改日期：{mt}</p>
                <Button onClick={()=>{
                    window.open(`/projects/${item.id}/editor`, '_blank');
                }}>
                    打开编辑器页面
                </Button>
            </div>
            <div class="right-top">
                <a onClick={()=>{
                    if (onClick){
                        onClick(item.id);
                    }
                }}>
                    {canRemove && "删除"}
                    {canTake && "恢复"}
                    {text && text}
                </a>
                <br />
                {more(item.id,item)}
            </div>
            <div class="children">
                {getChildren && getChildren(item.id,item)}
            </div>
        </div>
    )
}

const ProjectsList = ({items,canRemove,canTake,text,onClick,more,getChildren}) => {
    return (<div class="projects-list">
        {items.map((item) => <ProjectInfo item={item} canRemove={canRemove} canTake={canTake} text={text} onClick={onClick} more={more} getChildren={getChildren}></ProjectInfo>)}
    </div>);
};

module.exports = ProjectsList;
