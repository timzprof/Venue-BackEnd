import sgMail from '@sendgrid/mail';
import {config} from 'dotenv';

config();

sgMail.setApiKey(process.env.SEND_GRID_KEY);

/**
 * Send Mail
 * @param {Object} msg - Message Object
 * @param {String} msg.to - Mail Recipient
 * @param {String} msg.from - Mail Sender
 * @param {String} msg.subject - Mail Subject
 * @param {String} msg.html - Mail Html Text
 * @param {String} msg.replyTo - Mail Reply-To Recipient
 * @param {Array} msg.bcc - Mail BCC
 */
const sendMail = msg => {
  return sgMail.send(msg);
};

export default {sendMail};
