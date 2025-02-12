const classNames = require('classnames');
const PropTypes = require('prop-types');
const React = require('react');

const Navigation = require('../../navigation/www/navigation.jsx');
const Footer = require('../../footer/www/footer.jsx');
const DonorRecognition = require('./donor-recognition.jsx');
const ErrorBoundary = require('../../errorboundary/errorboundary.jsx');
const PrivacyBanner = require('../../privacy-banner/privacy-banner.jsx');

const Notice = require('../../notice/notice.jsx');

const today = new Date();
const semi = today.getDate() === 1 && today.getMonth() === 3;

const Page = ({
    children,
    className,
    showDonorRecognition
}) => (
    <ErrorBoundary componentName="Page">
        <div className={classNames('page', className)}>
            <nav
                className={classNames({
                    staging: process.env.SCRATCH_ENV === 'staging'
                })}
                id="navigation"
            >
                <Navigation />
            </nav>
            <PrivacyBanner />
            <Notice />
            <main id="view">
                {children}
            </main>
            <footer id="footer">
                <Footer />
            </footer>
            {showDonorRecognition &&
                <aside className="donor">
                    <DonorRecognition />
                </aside>
            }
            <aside className="donor">
                <div className="donor-text">
                    <a href="http://beian.miit.gov.cn/" target="_blank">陕ICP备2022003155号-2</a>
                </div>
            </aside>
        </div>
        {semi && <div style={{color: '#fff'}}>{';'}</div>}
    </ErrorBoundary>
);

Page.propTypes = {
    children: PropTypes.node,
    className: PropTypes.string,
    showDonorRecognition: PropTypes.bool
};

module.exports = Page;
