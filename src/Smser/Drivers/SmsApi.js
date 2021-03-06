'use strict'

/*
 * adonis-smser
 *
 * (c) Savaryn Yaroslav <yariksav@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

const BaseDriver = require('./BaseDriver')

/**
 * SmsApi driver for adonis smser
 *
 * @class SmsApi
 * @constructor
 */
class SmsApi extends BaseDriver {

  /**
   * This method is called by sms manager automatically
   * and passes the config object
   *
   * @method setConfig
   *
   * @param  {Object}  config
   */
  setConfig (config) {
    super.setConfig(config)
    if (!config || !config.username || !config.password) {
      throw Error ('SmsApi driver require config with "username" and "password" params')
    }
    const SmsApiCom = require('smsapicom')
    this.transporter  = new SmsApiCom()
    if (config.password.length === 32) {
      this.transporter.authentication.loginHashed(config.username, config.password)
    } else {
      this.transporter.authentication.login(config.username, config.password)
    }
  }

  /**
   * Send a message via message object
   *
   * @method send
   * @async
   *
   * @param  {Object} message
   *
   * @return {Object}
   *
   * @throws {Error} If promise rejects
   */
  
  async send (message) {
    super.send(message)
    let to = message.to.replace('+', '')
    // let to = message.to.map(r => r.replace('+', '')).join(',')
    let res = await this.transporter.message
      .sms()
      .from(message.from || this.config.from)
      .to(to)
      .message(message.text)
      .execute();

    /*
      response example:
     { count: 1,
        list:
         [ { id: '5B1947D03738302CE6FC531E',
             points: 0.033,
             number: '15005550002',
             date_sent: 1528383439,
             submitted_number: '+15005550002',
             status: 'QUEUE',
             error: null,
             idx: null } ] }
    */

    if (!res || !Array.isArray(res.list) || !res.list.length) {
      throw Error('Incorrect response')
    }
    return {
      message: message,
      id: res.list[0].id,
      date: res.list[0].date_sent
    }
  }
}

module.exports = SmsApi
