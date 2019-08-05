import {
    CONNECTION_DISCONNECTED as ANALYTICS_CONNECTION_DISCONNECTED,
    createConnectionFailedEvent
} from './service/statistics/AnalyticsEvents';
// 会议
import JitsiConference from './JitsiConference';
// 导入连接状态
import * as JitsiConnectionEvents from './JitsiConnectionEvents';
import Statistics from './modules/statistics/statistics';
// XMPP服务
import XMPP from './modules/xmpp/xmpp';

/**
 * Creates a new connection object for the Jitsi Meet server side video
 * conferencing service. Provides access to the JitsiConference interface.
 * @param appID identification for the provider of Jitsi Meet video conferencing
 * services.
 * @param token the JWT token used to authenticate with the server(optional)
 * @param options Object with properties / settings related to connection with
 * the server.
 * @constructor
 */
export default function JitsiConnection(appID, token, options) {
    this.appID = appID;
    this.token = token;
    this.options = options;
    this.xmpp = new XMPP(options, token);

    /* eslint-disable max-params */
    this.addEventListener(JitsiConnectionEvents.CONNECTION_FAILED,
        (errType, msg, credentials, details) => {
            Statistics.sendAnalyticsAndLog(
                createConnectionFailedEvent(errType, msg, details));
        });
    /* eslint-enable max-params */

    this.addEventListener(JitsiConnectionEvents.CONNECTION_DISCONNECTED,
        msg => {
            // we can see disconnects from normal tab closing of the browser
            // and then there are no msgs, but we want to log only disconnects
            // when there is real error
            // XXX Do we need the difference in handling between the log and
            // analytics event here?
            if (msg) {
                Statistics.sendAnalytics(
                    ANALYTICS_CONNECTION_DISCONNECTED,
                    { message: msg });
            }
            Statistics.sendLog(
                JSON.stringify(
                    {
                        id: ANALYTICS_CONNECTION_DISCONNECTED,
                        msg
                    }));
        });
}

/**
 * Connect the client with the server.
 * @param options {object} connecting options
 * (for example authentications parameters).
 */
JitsiConnection.prototype.connect = function(options = {}) {
    this.xmpp.connect(options.id, options.password);
};

/**
 * Attach to existing connection. Can be used for optimizations. For example:
 * if the connection is created on the server we can attach to it and start
 * using it.
 *
 * @param options {object} connecting options - rid, sid and jid.
 */
JitsiConnection.prototype.attach = function(options) {
    this.xmpp.attach(options);
};

/**
 * Disconnect the client from the server.
 * @returns {Promise} - Resolves when the disconnect process is finished or rejects with an error.
 */
// 断开连接
JitsiConnection.prototype.disconnect = function(...args) {
    // XXX Forward any arguments passed to JitsiConnection.disconnect to
    // XMPP.disconnect. For example, the caller of JitsiConnection.disconnect
    // may optionally pass the event which triggered the disconnect in order to
    // provide the implementation with finer-grained context.
    return this.xmpp.disconnect(...args);
};

/**
 * Returns the jid of the participant associated with the XMPP connection.
 *
 * @returns {string} The jid of the participant.
 */
JitsiConnection.prototype.getJid = function() {
    return this.xmpp.getJid();
};

/**
 * This method allows renewal of the tokens if they are expiring.
 * @param token the new token.
 */
JitsiConnection.prototype.setToken = function(token) {
    this.token = token;
};

/**
 * Creates and joins new conference.
 * @param name the name of the conference; if null - a generated name will be
 * provided from the api
 * @param options Object with properties / settings related to the conference
 * that will be created.
 * @returns {JitsiConference} returns the new conference object.
 */
// 初始化会议
JitsiConnection.prototype.initJitsiConference = function(name, options) {
    return new JitsiConference({
        name,
        config: options,
        connection: this
    });
};

/**
 * Subscribes the passed listener to the event.
 * @param event {JitsiConnectionEvents} the connection event.
 * @param listener {Function} the function that will receive the event
 */
// 设置XMPP服务监听
JitsiConnection.prototype.addEventListener = function(event, listener) {
    this.xmpp.addListener(event, listener);
};

/**
 * Unsubscribes the passed handler.
 * @param event {JitsiConnectionEvents} the connection event.
 * @param listener {Function} the function that will receive the event
 */
// 移出XMPP服务监听
JitsiConnection.prototype.removeEventListener = function(event, listener) {
    this.xmpp.removeListener(event, listener);
};

/**
 * Returns measured connectionTimes.
 */
// 获取连接次数
JitsiConnection.prototype.getConnectionTimes = function() {
    return this.xmpp.connectionTimes;
};

/**
 * Adds new feature to the list of supported features for the local
 * participant.
 * @param {String} feature the name of the feature.
 * @param {boolean} submit if true - the new list of features will be
 * immediately submitted to the others.
 */
// 将新特性添加到本地支持的特性列表中参与者。
JitsiConnection.prototype.addFeature = function(feature, submit = false) {
    return this.xmpp.caps.addFeature(feature, submit);
};

/**
 * Removes a feature from the list of supported features for the local
 * participant
 * @param {String} feature the name of the feature.
 * @param {boolean} submit if true - the new list of features will be
 * immediately submitted to the others.
 */
// 从本地支持的特性列表中删除一个特性参与者
JitsiConnection.prototype.removeFeature = function(feature, submit = false) {
    return this.xmpp.caps.removeFeature(feature, submit);
};
