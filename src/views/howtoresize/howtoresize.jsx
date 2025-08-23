const FormattedMessage = require('react-intl').FormattedMessage;
const injectIntl = require('react-intl').injectIntl;
const React = require('react');

const Page = require('../../components/page/www/page.jsx');
const intlShape = require('../../lib/intl-shape.js');
const render = require('../../lib/render.jsx');

const InformationPage = require('../../components/informationpage/informationpage.jsx');

require('./howtoresize.scss');

const step_file = require("./step.md").default;

const Markdown = require("../../components/markdown/markdown.jsx").default;
const { MarkdownDownLoader } = require("../../components/markdown/markdown.jsx");

const Guidelines = () => (
    <InformationPage title="Scratch 创世界中的素材如何减少大小">
        <div className="inner info-inner">
            <section id="limit">
                <span className="nav-spacer" />
                <h2>素材大小限制</h2>
                <dl>
                    <dt>为什么作品保存时提示素材太大？</dt>
                    <dd>Scratch 创世界中的素材大小限制为 10MB，超过这个大小的素材将无法保存。</dd>
                    <dt>素材大小限制是否会影响作品的运行速度？</dt>
                    <dd>不会，素材大小限制只是为了保护 Scratch 创世界的运行速度，不会影响作品的运行速度。</dd>
                    <dt>素材如果太大会影响什么？</dt>
                    <dd>素材如果太大，会导致作品加载变慢，导致其他用户加载变慢，拖慢整个网站的速度（同时让站长面临更多经济压力）</dd>
                </dl>
            </section>
            <section id="method">
                <span className="nav-spacer" />
                <h2>减小素材大小的方法</h2>
                <dl>
                    <dt>有什么方法可以找出并减小作品中太大的素材吗？</dt>
                    <dd>有，后面会给出。</dd>
                    <dt>Scratch创世界中素材大小限制是多少？</dt>
                    <dd>图片：2MB<br />
                    WAV音频文件：5MB<br />
                    其他音频文件：10MB</dd>
                </dl>
            </section>
            <section id="step">
                <span className="nav-spacer" />
                <h2>查找大素材和减小素材大小的步骤</h2>
                <dl>
                    <dt>关于查找大素材和减小素材大小的步骤的Markdown说明文件</dt>
                    <dd>
                        <Markdown getContent={content => content} className="mkdn" base64Url>
                            {step_file}
                        </Markdown>
                    </dd>
                    <dt>说明文件下载链接</dt>
                    <dd>
                        <MarkdownDownLoader text="点我下载" title="Scratch创世界素材减小大小指南">{step_file}</MarkdownDownLoader>
                    </dd>
                </dl>
            </section>
        </div>
        <nav>
            <ol>
                <li><a href="#limit">素材大小限制</a></li>
                <li><a href="#method">减小素材大小的方法</a></li>
                <li><a href="#step">查找大素材和减小素材大小的步骤</a></li>
            </ol>
        </nav>
    </InformationPage>
);

render(<Page><Guidelines /></Page>, document.getElementById('app'));
