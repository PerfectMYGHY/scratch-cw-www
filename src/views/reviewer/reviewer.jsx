/* eslint-disable max-len */
const React = require('react');

const Box = require('../../components/box/box.jsx');

const Page = require('../../components/page/www/page.jsx');
const render = require('../../lib/render.jsx');

require('./reviewer.scss');

const Reviewer = () => (
    <div className="inner reviewer">
        <Box
            title="审核员招募"
        >
            <p>
                Scratch创世界 目前打算招募审核员，下面是招募审核员的详细信息。
            </p>
            <p style={{color: 'red'}}>
                <strong>申请前请先阅读：</strong>
                <a href="/community_rules">《社区规则》</a>
                （包含《审核员行为准则》、《审核流程说明》、《精选作品评选规范》）
            </p>
            <dl>
                <dt>审核员招募规则</dt>
                <dd>
                    <strong>一、报名方式</strong><br />
                    使用邮箱发送报名邮件至站长邮箱：916881890@qq.com<br />
                    邮件标题格式：[审核员申请] + 你的用户名<br />
                    邮件正文需包含：<br />
                    1. 用户名<br />
                    2. 年龄（须 ≥ 9 岁）<br />
                    3. 平时在线时段（如：每天晚上 7-9 点）<br />
                    4. 申请理由（简短说明为什么想当审核员）<br />
                    5. 联系方式（QQ号 + 手机号）
                </dd>
                <dd>
                    <strong>二、规则确认</strong><br />
                    报名邮件末尾请复制并填写以下确认声明：<br />
                    本人已仔细阅读并理解社区规则（<a href="/community_rules">https://www.scratch-cw.top/community_rules</a>）中《审核员行为准则》、《审核流程说明》和《精选作品评选规范》的全部内容，清楚知晓自己的权利和义务，愿意遵守社区相关规定，认真履行审核员职责。
                </dd>
                <dd>
                    <strong>三、招录流程</strong><br />
                    第 1 步：提交申请：按上述要求发送报名邮件，等待站长回复。<br />
                    第 2 步：初步审核：站长根据申请信息进行初步审核，判断是否符合基本条件（年龄、注册时长、违规记录等）。<br />
                    第 3 步：通知核验：初步审核通过后，站长会回复邮件，告知你需要提交身份核验信息。<br />
                    第 4 步：提交核验信息：
                    <table border="1">
                        <thead>
                            <tr><th>核验项目</th><th>内容说明</th></tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>手机号验证</td>
                                <td>按邮件指引完成双向验证</td>
                            </tr>
                            <tr>
                                <td>身份证信息</td>
                                <td>上传身份证正反面照片（可添加水印“仅用于审核员身份核验”）</td>
                            </tr>
                            <tr>
                                <td>视频自我介绍</td>
                                <td>
                                    录制 30 秒短视频，需满足以下要求：<br />
                                    - <strong>拍摄范围：</strong>露出上半身及头部，确保面部清晰可见<br />
                                    - <strong>动作要求：</strong>面对镜头，全程目视摄像头，自然表达<br />
                                    - <strong>内容要求：</strong>清晰说出你的用户名、年龄、为什么想当审核员<br />
                                    - <strong>环境要求：</strong>光线充足，背景简洁，无噪音干扰<br />
                                    - <strong>格式要求：</strong>MP4 格式，时长 30 秒左右，无需剪辑或添加特效<br />
                                    <strong style={{color: '#e74c3c'}}>⚠️ 注意：画面模糊、无法辨认身份或未按要求录制，将直接退回重拍！</strong>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    第 5 步：最终审核：站长核验信息无误后，进行最终审核。<br />
                    第 6 步：结果通知：通过则邮件告知，同时将你加入「审核员」用户组和审核员 QQ 群；未通过则邮件告知原因，核验信息由站长删除（不留存），不影响普通用户身份。
                </dd>
                <dd>
                    <strong>四、招录标准</strong><br />
                    站长会重点核查以下内容：<br />
                    - 年龄 ≥ 9 岁<br />
                    - 注册时长 ≥ 30 天<br />
                    - <strong>作品数量与质量：</strong>已分享作品中至少包含 3 个及以上数量的作品（申请时如有未审核作品，站长当场审核确认）<br />
                    - <strong>社区活跃度：</strong>有一定活跃表现（发表有质量的评论、积极互动等，由站长综合判断）<br />
                    - 申请理由认真、具体<br />
                    - 手机号验证通过<br />
                    - 身份信息真实有效<br />
                    <br />
                    <strong>特别说明：</strong>作品数量要求旨在确保审核员本身具备一定的 Scratch 创作经验，能够更准确地判断他人作品质量。<br />
                    <strong>特别说明：</strong>未成年人请经过成年人同意。<br />
                    <br />
                    违规记录参考标准：
                    <table border="1">
                        <thead>
                            <tr><th>情况</th><th>处理</th></tr>
                        </thead>
                        <tbody>
                            <tr><td>曾因恶意抄袭 / 发布违规内容 / 恶意举报被封禁或严重警告</td><td>不予通过</td></tr>
                            <tr><td>曾因转载未标注、作品质量被驳回、缺少标题/操作说明等轻微违规，但已改正 ≥ 30 天</td><td>不影响申请，仅作参考</td></tr>
                            <tr><td>无心之失，已改正</td><td>不会影响申请</td></tr>
                        </tbody>
                    </table>
                </dd>
                <dd>
                    <strong>五、隐私承诺</strong><br />
                    - 以上身份信息仅用于审核员身份核验和纠纷追溯，站长承诺严格保密<br />
                    - 信息仅在任期内留存，退出审核员后站长将删除相关存档<br />
                    - 不会对外泄露或用于其他用途
                </dd>
                <dd>
                    <strong>六、注意事项</strong><br />
                    - 无需值班，有空时自行登录审核即可<br />
                    - 特别提醒：目前社区有约 700 件历史积压作品，欢迎大家在空闲时帮忙审核！早清完早恢复正常时限～<br />
                    - 恶意抢单后长期不审，或连续 30 天无任何审核记录且未向站长报备 → 取消审核员资格，身份信息同步删除<br />
                    - 精选误判累计方式与普通审核误判相同，会影响审核员整体考核<br />
                    - 特殊情况（如考试、外出等）提前向站长报备即可，不影响资格<br />
                    - <strong>入选后：</strong>你的账户会出现在 <a href="/our_team">「我们的团队」</a> 页面中，正式成为社区核心成员！
                </dd>

                <dt>邮件模板</dt>
                <dd>
                    <strong>模板一：申请信</strong><br />
                    邮件标题：[审核员申请] 你的用户名<br />
                    邮件正文：<br />
                    站长好！<br />
                    <br />
                    我想申请成为社区的审核员，以下是我的基本信息：<br />
                    <br />
                    用户名：__________<br />
                    年龄：__________岁<br />
                    平时在线时段：__________<br />
                    申请理由：__________<br />
                    联系方式（QQ号）：__________<br />
                    手机号：__________<br />
                    <br />
                    本人已仔细阅读并理解社区规则（<a href="/community_rules">https://www.scratch-cw.top/community_rules</a>）中《审核员行为准则》、《审核流程说明》和《精选作品评选规范》的全部内容，清楚知晓自己的权利和义务，愿意遵守社区相关规定，认真履行审核员职责。<br />
                    <br />
                    本人确认以上所填信息真实有效，并同意在后续核验环节提交身份信息及完成手机号验证。<br />
                    <br />
                    用户名：__________<br />
                    日期：__________<br />
                    <br />
                    期待你的回复，谢谢！
                </dd>
                <dd>
                    <strong>模板二：核验邮件</strong><br />
                    邮件标题：[审核员核验] 你的用户名<br />
                    邮件正文：<br />
                    站长好！<br />
                    <br />
                    我已收到初步审核通过通知，现按要求提交身份核验信息：<br />
                    <br />
                    用户名：__________<br />
                    <br />
                    1. 身份证信息<br />
                    见附件：身份证正反面照片（可添加水印）<br />
                    <br />
                    2. 视频自我介绍<br />
                    见附件：30 秒短视频。<strong style={{color: '#e74c3c'}}>请露出上半身及头部，面对镜头说出用户名和申请理由。画面模糊或未按要求录制将退回重拍！</strong><br />
                    <br />
                    手机号双向验证我会按照要求完成。<br />
                    <br />
                    以上信息仅用于审核员身份核验，请查收并保密。<br />
                    <br />
                    谢谢！
                </dd>
            </dl>
            <div className="reviewer-footer">
                <img
                    alt="sprites"
                    src="/images/spritesforcommunityguid.png"
                />
            </div>
        </Box>
    </div>
);

render(<Page><Reviewer /></Page>, document.getElementById('app'));
