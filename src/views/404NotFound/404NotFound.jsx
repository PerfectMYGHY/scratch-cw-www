// JavaScript source code

const React = require('react');

const Page = require('../../components/page/www/page.jsx');
const NotAvailable = require('../../components/not-available/not-available.jsx');
const render = require('../../lib/render.jsx');

render(<Page><NotAvailable /></Page>, document.getElementById('app'));
