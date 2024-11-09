const FormattedMessage = require('react-intl').FormattedMessage;
const injectIntl = require('react-intl').injectIntl;
const React = require('react');

const Page = require('../../components/page/www/page.jsx');
const intlShape = require('../../lib/intl-shape');
const render = require('../../lib/render.jsx');

const InformationPage = require('../../components/informationpage/informationpage.jsx');

require('./make_ext.scss');

const step_file = require("./step.md").default;

const Markdown = require("../../components/markdown/markdown.jsx").default;
const { MarkdownDownLoader } = require("../../components/markdown/markdown.jsx");

const Guidelines = () => (
    <InformationPage title="Scratch 扩展设计指南">
        <div className="inner info-inner">
            <section id="for">
                <span className="nav-spacer" />
                <h2>面向人群</h2>
                <dl>
                    <dt>哪些人可以编写 Scratch 扩展？</dt>
                    <dd>这个页面面对的是有编程经验的人群，并且至少会JavaScript编程。如果您不会JavaScript，那么您就不能开发 Scratch 扩展。</dd>
                </dl>
            </section>
            <section id="model">
                <span className="nav-spacer" />
                <h2>模板介绍</h2>
                <dl>
                    <dt>有什么开发的模板吗？</dt>
                    <dd>有，后面会给出。您可以根据模板写出一个全新的扩展，然后通过 916881890@qq.com 发给我们。我们会审核你的代码，如果审核通过，那么您的扩展将会出现在 Scratch 创世界的编辑器上！</dd>
                </dl>
            </section>
            <section id="step">
                <span className="nav-spacer" />
                <h2>开发步骤</h2>
                <dl>
                    <dt>关于开发的Markdown说明文件</dt>
                    <dd>
                        <Markdown getContent={content => content} className="mkdn" base64Url>
                            {step_file}
                        </Markdown>
                    </dd>
                    <dt>说明文件下载链接</dt>
                    <dd>
                        <MarkdownDownLoader text="点我下载">{step_file}</MarkdownDownLoader>
                    </dd>
                </dl>
            </section>
        </div>
        <nav>
            <ol>
                <li><a href="#for">面向人群</a></li>
                <li><a href="#model">模板介绍</a></li>
                <li><a href="#step">开发步骤</a></li>
            </ol>
        </nav>
    </InformationPage>
);

render(<Page><Guidelines /></Page>, document.getElementById('app'));
