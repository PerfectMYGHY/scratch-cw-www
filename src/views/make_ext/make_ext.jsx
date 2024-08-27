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
                    <dd>这个页面面对的是有编程经验的人群，并且必须会Node.js编程。如果您不会编程或node.js，那么您就不能开发Scratch 扩展。</dd>
                </dl>
            </section>
            <section id="model">
                <span className="nav-spacer" />
                <h2>模板介绍</h2>
                <dl>
                    <dt>有什么开发的模板吗？</dt>
                    <dd>有，后面会给出。不过分为两种模式：1.测试版，是测试时用的版本；2.正式版，就是当你想要给我们推荐你的Scratch插件进入线上编辑器时向我们发送的文件。</dd>
                    <dt>两者区别是什么？</dt>
                    <dd>实际上，正式版是扩展的源代码，我们在加入扩展是必须放入源代码。但是由于测试方式，必须要将源代码变成可立即在网页上执行的程序，就必须要把正式版改为测试版</dd>
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
