'use strict';
const utils = require('./utils');
const webpack = require('webpack');
const config = require('../config');
const merge = require('webpack-merge');
const path = require('path');
const baseWebpackConfig = require('./webpack.base.conf');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin');
const portfinder = require('portfinder');

const HOST = process.env.HOST;
const PORT = process.env.PORT && Number(process.env.PORT);

const devWebpackConfig = merge(baseWebpackConfig, {
    module: {
        rules: utils.styleLoaders({ sourceMap: config.dev.cssSourceMap, usePostCSS: true })
    },
    // cheap-module-eval-source-map is faster for development
    devtool: config.dev.devtool,

    // these devServer options should be customized in /config/index.js
    devServer: {
        clientLogLevel: 'warning',
        historyApiFallback: {
            rewrites: [{ from: /.*/, to: path.posix.join(config.dev.assetsPublicPath, 'index.html') }]
        },
        hot: true,
        contentBase: false, // since we use CopyWebpackPlugin.
        compress: true,
        host: HOST || config.dev.host,
        port: PORT || config.dev.port,
        open: config.dev.autoOpenBrowser,
        overlay: config.dev.errorOverlay ? { warnings: false, errors: true } : false,
        publicPath: config.dev.assetsPublicPath,
        proxy: config.dev.proxyTable,
        quiet: true, // necessary for FriendlyErrorsPlugin
        watchOptions: {
            poll: config.dev.poll
        }
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env': require('../config/dev.env')
        }),
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NamedModulesPlugin(), // HMR shows correct file names in console on update.
        new webpack.NoEmitOnErrorsPlugin(),
        // https://github.com/ampedandwired/html-webpack-plugin
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: 'index.html',
            inject: true
        }),
        // copy custom static assets
        new CopyWebpackPlugin([
            {
                from: path.resolve(__dirname, '../static'),
                to: config.dev.assetsSubDirectory,
                ignore: ['.*']
            }
        ])
    ]
});

module.exports = new Promise((resolve, reject) => {
    portfinder.basePort = process.env.PORT || config.dev.port;
    portfinder.getPort((err, port) => {
        if (err) {
            reject(err);
        } else {
            // publish the new Port, necessary for e2e tests
            process.env.PORT = port;
            // add port to devServer config
            devWebpackConfig.devServer.port = port;

            // Add FriendlyErrorsPlugin
            devWebpackConfig.plugins.push(
                new FriendlyErrorsPlugin({
                    compilationSuccessInfo: {
                        messages: [
                            `
Your application is running here:
    im-server:  http://localhost:${port}/#/imServer
    im-client:  http://localhost:${port}/#/imclient
                        `
                        ]
                    },
                    onErrors: config.dev.notifyOnErrors ? utils.createNotifierCallback() : undefined
                })
            );

            resolve(devWebpackConfig);
        }
    });
});

// express
const app = require('express')();
const fileUpload = require('express-fileupload');
app.use(fileUpload()); // for parsing multipart/form-data
app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, Pragma');
    res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
    if (req.method === 'OPTIONS') {
        res.sendStatus(204);
    } else {
        next();
    }
});
// ????????????
app.post('/upload', function(req, res) {
    if (!req.files) {
        return res.status(400).send('No files were uploaded.');
    }
    // save file
    // <input type="file" name="uploadFile" />
    let file = req.files.uploadFile;
    let encodeFileName = Number.parseInt(Date.now() + Math.random()) + file.name;
    file.mv(path.resolve(__dirname, '../static/upload/') + '/' + encodeFileName, function(err) {
        if (err) {
            return res.status(500).send({
                code: err.code,
                data: err,
                message: '??????????????????'
            });
        }
        res.send({
            code: 0,
            data: {
                fileName: file.name,
                fileUrl: `http://${devWebpackConfig.devServer.host}:3000/static/upload/${encodeFileName}`
            },
            message: '??????????????????'
        });
    });
});

// ????????????
app.get('/static/upload/:fileName', function(req, res) {
    res.sendFile(path.resolve(__dirname, '../static/upload') + '/' + req.params.fileName);
});
// ??????im????????????
app.get('/getIMServerList', function(req, res) {
    res.json({
        code: 0,
        data: Array.from(serverChatDic.values()).map((item) => {
            return item.serverChatEn;
        }) // ?????????serverChatDic.values??????serverChatEn
    });
});
app.listen(3000);

// socket
var server = require('http').createServer();
var io = require('socket.io')(server);
var serverChatDic = new Map(); // ?????????
var clientChatDic = new Map(); // ?????????
io.on('connection', function(socket) {
    // ???????????????
    socket.on('SERVER_ON', function(data) {
        let serverChatEn = data.serverChatEn;
        console.log(`??????????????????socket?????????????????????Id000???${serverChatEn.serverChatId}`);
        serverChatDic.set(serverChatEn.serverChatId, {
            serverChatEn: serverChatEn,
            socket: socket
        });
    });

    // ???????????????
    socket.on('SERVER_OFF', function(data) {
        let serverChatEn = data.serverChatEn;
        serverChatDic.delete(serverChatEn.serverChatId);
    });

    // ????????????????????????
    socket.on('SERVER_SEND_MSG', function(data) {
        if (clientChatDic.has(data.clientChatId)) {
            clientChatDic.get(data.clientChatId).socket.emit('SERVER_SEND_MSG', { msg: data.msg });
        }
    });

    // ??????????????????'CLIENT_ON'(??????), 'CLIENT_OFF'(??????), 'CLIENT_SEND_MSG'(????????????)
    ['CLIENT_ON', 'CLIENT_OFF', 'CLIENT_SEND_MSG'].forEach((eventName) => {
        socket.on(eventName, (data) => {
            let clientChatEn = data.clientChatEn;
            let serverChatId = data.serverChatId;
            // 1.???????????????
            if (serverChatDic.has(serverChatId)) {
                serverChatDic.get(serverChatId).socket.emit(eventName, {
                    clientChatEn: clientChatEn,
                    msg: data.msg
                });
            } else {
                socket.emit('SERVER_SEND_MSG', {
                    msg: {
                        content: '???????????????'
                    }
                });
            }

            // 2.??????????????????????????????
            if (eventName === 'CLIENT_ON') {
                // 1)'CLIENT_ON'??????????????????????????????
                console.log(`??????????????????socket?????????????????????Id???${clientChatEn.clientChatId}`);
                clientChatDic.set(clientChatEn.clientChatId, {
                    clientChatEn: clientChatEn,
                    socket: socket
                });
                serverChatDic.has(serverChatId) &&
                    socket.emit('SERVER_CONNECTED', {
                        serverChatEn: serverChatDic.get(serverChatId).serverChatEn
                    });
            } else if (eventName === 'CLIENT_OFF') {
                // 2)'CLIENT_OFF'???????????????
                clientChatDic.delete(clientChatEn.clientChatId);
            }
        });
    });
});
server.listen(3001);
