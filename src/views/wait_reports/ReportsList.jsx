/* eslint-disable react/jsx-no-bind */
/* eslint-disable valid-jsdoc */
import PropTypes from 'prop-types';

const React = require('react');
const Button = require('../../components/forms/button.jsx');
const classNames = require('classnames');

require('./ReportsList.scss');

/**
 * 单个举报项组件
 */
const ReportItem = ({
    report, // 举报数据
    canRemove, // 是否可删除
    canTake, // 是否可恢复
    text, // 自定义按钮文字
    onClick, // 点击回调 (pid, cid, rid)
    more, // 更多操作回调 (pid, item, cid, rid)
    getChildren, // 额外内容回调 (pid, item, report)
    btnText // 按钮文字（原 btnt）
}) => {
    // 判断是作品举报还是评论举报
    const isProjectReport = !!report.project;
    const isCommentReport = !isProjectReport && report.body?.cid;
    
    // 获取作品ID（两种举报都有 project 字段）
    const projectId = report.project?.id || report.body?.project;
    const commentId = isCommentReport ? report.body.cid : null;
    const reportId = report.id;
    
    // 格式化时间
    const modifiedTime = report.modified_time ? new Date(report.modified_time) : new Date();
    // eslint-disable-next-line max-len
    const formattedDate = `${modifiedTime.getFullYear()}-${String(modifiedTime.getMonth() + 1).padStart(2, '0')}-${String(modifiedTime.getDate()).padStart(2, '0')}`;
    
    // 处理点击事件
    const handleClick = () => {
        if (onClick) {
            onClick(projectId, commentId, reportId);
        }
    };
    
    // 渲染更多操作
    const renderMore = () => {
        if (more) {
            return more(projectId, report, commentId, reportId);
        }
        return null;
    };
    
    // 渲染额外内容
    const renderChildren = () => {
        if (getChildren) {
            return getChildren(projectId, report, report);
        }
        return null;
    };
    
    // 渲染按钮文字
    const getButtonText = () => {
        if (canTake) return '恢复';
        if (text) return text;
        if (btnText) return btnText;
        if (canRemove) return '删除';
        return null;
    };
    
    return (
        <div className="report-item">
            {/* 作品缩略图（仅作品举报有） */}
            {isProjectReport && report.project?.image && (
                <a
                    className="thumbnail-image"
                    href={`/projects/${projectId}/`}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <img
                        alt={report.project.title || '项目封面'}
                        src={report.project.image}
                    />
                </a>
            )}
            
            {/* 作品信息（作品举报） */}
            {isProjectReport && report.project && (
                <div className="info narrow">
                    <a
                        href={`/projects/${projectId}/`}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {report.project.title || '未命名作品'}
                    </a>
                    <p>最后修改日期：{formattedDate}</p>
                    <Button
                        onClick={() => {
                            window.open(`/projects/${projectId}/editor`, '_blank');
                        }}
                    >
                        打开编辑器页面
                    </Button>
                </div>
            )}
            
            {/* 评论信息（评论举报） */}
            {isCommentReport && (
                <div
                    className={classNames({
                        info: true,
                        wide: true,
                        project: isProjectReport
                    })}
                >
                    <p>
                        来自：
                        <a
                            href={`/projects/${projectId}/`}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            {report.p_title || '未知作品'}
                        </a>
                    </p>
                    <p>内容：{report.body?.content || '无内容'}</p>
                    <p>
                        作者：
                        <a
                            href={`/users/${report.u_info?.user?.username || ''}/`}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            {report.u_info?.user?.username || '未知用户'}
                        </a>
                    </p>
                    <p>
                        举报者：
                        <a
                            href={`/users/${report.sendfrom_info?.user?.username || ''}/`}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            {report.sendfrom_info?.user?.username || '未知用户'}
                        </a>
                    </p>
                </div>
            )}
            
            {/* 右侧操作按钮 */}
            <div className="right-top">
                <a onClick={handleClick}>
                    {getButtonText()}
                </a>
                <br />
                {renderMore()}
            </div>
            
            {/* 额外信息（举报类型、举报内容等） */}
            {renderChildren() && (
                <div className="children">
                    {renderChildren()}
                </div>
            )}
        </div>
    );
};

const Report = PropTypes.shape({
    id: PropTypes.number,
    project: PropTypes.shape({
        id: PropTypes.number,
        image: PropTypes.string,
        title: PropTypes.string
    }),
    body: PropTypes.shape({
        cid: PropTypes.number,
        project: PropTypes.number,
        content: PropTypes.string
    }),
    modified_time: PropTypes.string,
    p_title: PropTypes.string,
    u_info: PropTypes.shape({
        user: PropTypes.shape({
            username: PropTypes.string
        })
    }),
    sendfrom_info: PropTypes.shape({
        user: PropTypes.shape({
            username: PropTypes.string
        })
    })
});

ReportItem.propTypes = {
    report: Report,
    canRemove: PropTypes.bool,
    canTake: PropTypes.bool,
    text: PropTypes.string,
    onClick: PropTypes.func,
    more: PropTypes.func,
    getChildren: PropTypes.func,
    btnText: PropTypes.string
};

/**
 * 举报列表组件
 */
const ReportsList = ({
    items, // 举报数据数组
    canRemove = false,
    canTake = false,
    text = '',
    onClick,
    more,
    getChildren,
    btnt // 原组件用的 btnt
}) => {
    if (!items || items.length === 0) {
        return <div className="reports-list empty">暂无举报</div>;
    }
    
    return (
        <div className="reports-list">
            {items.map((item, index) => (
                <ReportItem
                    key={item.id || index}
                    report={item}
                    canRemove={canRemove}
                    canTake={canTake}
                    text={text}
                    onClick={onClick}
                    more={more}
                    getChildren={getChildren}
                    btnText={btnt}
                />
            ))}
        </div>
    );
};

ReportsList.propTypes = {
    items: PropTypes.arrayOf(Report),
    canRemove: PropTypes.bool,
    canTake: PropTypes.bool,
    text: PropTypes.string,
    onClick: PropTypes.func,
    more: PropTypes.func,
    getChildren: PropTypes.func,
    btnt: PropTypes.string
};

module.exports = ReportsList;
