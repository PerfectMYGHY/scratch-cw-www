const React = require('react');

const getStatus = item => {
    if (item.approved) {
        return (
            <span
                style={{
                    color: '#4CAF50'
                }}
            >审核已通过</span>
        );
    } else if (item.pending) {
        return (
            <span
                style={{
                    color: '#ff9800'
                }}
            >审核暂缓中</span>
        );
    } else if (item.escalated) {
        return (
            <span
                style={{
                    color: '#2196F3'
                }}
            >审核转争议</span>
        );
    } else if (item.reviewing) {
        return (
            <span
                style={{
                    color: '#f44336'
                }}
            >审核已驳回</span>
        );
    }
    return (
        <span
            style={{
                color: '#999'
            }}
        >审核中...</span>
    );
};

module.exports = getStatus;
