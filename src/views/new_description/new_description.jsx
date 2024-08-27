const FormattedMessage = require('react-intl').FormattedMessage;
const React = require('react');

const Box = require('../../components/box/box.jsx');

const Page = require('../../components/page/www/page.jsx');
const render = require('../../lib/render.jsx');

require('./new_description.scss');

const NewDescription = () => (
    <div className="inner new_description">
        <Box
            title={
                "新手简介"
            }
        >
            <p>
                {
                    "我们欢迎 Scratch创世界 新用户！最为一个新用户，你应该了解一些关于该社区的简介和机制等。"
                }
            </p>
            <dl>
                <dt>{"我们的网站"}</dt>
                <dd>{"我们的社区，是完全由站长一个人完成前端后端代码的。并且完全是因个人爱好而非任何商业性质建立起的网站。"}</dd>
                <dd>{"该社区支持切换页面时可以保留Scratch创世界的运行进度，就是在切换作品页面和编辑器页面时，你当前作品运行的进度会被保存。"}</dd>
                <dd>{"作为一个新用户，你首先得了解以下信息："}</dd>
                <dt>{"特有的 Scratch 编辑器"}</dt>
                <dd>{"本网站使用了改编自国外出名的 TurboWarp 版 Scratch 3.0 编辑器，仅仅对其做了一些小改动（就是花了两周使其能够匹配scratch-www的接口以及使其插件和其插件的Redux Store能正常运行）"}</dd>
                <dd>{"下面是站长总结的 TurboWarp 版 Scratch 3.0 （简称TurboWarp）比原版 Scratch 3.0 （简称Scratch）多的优点："}</dd>
                <dd>{"1.TurboWarp新增了还原点功能，当你的作品因手滑大部分修改错误并保存而且没法撤销时，可以尝试使用还原点还原到项目之前的版本（打开还原点时会新建项目），点击 文件 > 还原点 以查看。"}</dd>
                <dd>{"2.TurboWarp提供了高级功能，可以提供 Scratch 的 60帧 丝滑模式 、 无限克隆 、 自定义舞台大小、启动编译器（就是运行时修改代码后即时更新运行的代码）等高级功能，还可以将其中一些设置保存至项目文件，使得任何时候打开项目这些配置都会自动加载。"}</dd>
                <dd>{"3.TurboWarp提供了许多插件，修复了 Scratch 的一些 bug ， 并使得编写代码时更轻松，更便捷！例如：搜索代码，造型编辑器的对齐线，项目界面录制，项目暂停（可以暂停代码的运行，过一会儿可以继续），调试器等"}</dd>
                <dd>{"4.TurboWarp在 Scratch 原有扩展的基础上提供了更多实用的扩展，使得编写代码效率更高，实现一些在 Scratch 中很难或根本不可能实现的功能。（更好的一方面是提供了编程人员开发Scratch扩展时的一些更实用工具）"}</dd>
                <dd>{"不仅只有这些，感兴趣的话可以自己尝试或网上搜索！"}</dd>
                <dt>{"创建作品"}</dt>
                <dd>{"可以点击页面左上角的『创建』你的新作品！你可以按下Ctrl+S或点击文件->保存以保存你的作品到我们网站。在你希望别人可以看到你的作品时，你可以点击『分享』按钮以公开作品，在通过审核后你的作品就可以被大家看见了。"}</dd>
                <dt>{"如何做一个好的Scratcher"}</dt>
                <dd>
                    {/*<em>{"所有Scratcher都可能会犯错，或者说做了好事。因此我们制定了如下奖罚机制"}</em><br />*/}
                    {"1.你在看到别人的作品有不对时，可以点击旁边的『举报』按钮。"}<br />
                    {"2.如果你发现别人的评论非常不友好，可以点击旁边的『举报』按钮。"}<br />
                    {"3.不要做上面被举报的人。"}<br />
                    {"4.不可以随意乱举报！"}<br />
                    <em>
                        详细见<a href="/community_mechanism">社区机制</a>
                    </em>
                </dd>
                <dt>{"S币"}</dt>
                <dd>{"新用户默认有 50 个S币，它的主要用途是改编项目。"}</dd>
                <dd>{"同时你可以通过分享本网站给别人以获得 S币 。"}<br />
                    <em>
                        详细见<a href="/community_mechanism">社区机制</a>
                    </em>
                </dd>
                <dt>{"最后"}</dt>
                <dd>{"我们希望这个社区会是活跃的，大家要积极分享，积极创作！"}</dd>
                <dt>{"回到首页"}</dt>
                <dd>
                    <a href="/">专门给懒人的链接</a>
                </dd>
            </dl>
            <div className="new_description-footer">
                <img
                    alt="sprites"
                    src="/images/spritesforcommunityguid.png"
                />
            </div>
        </Box>
    </div>
);

render(<Page><NewDescription /></Page>, document.getElementById('app'));
