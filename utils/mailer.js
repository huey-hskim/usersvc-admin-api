const nodemailer = require('nodemailer');

const { ErrorCode } = require('../usersvc-common/constant/consts');

const default_from = '"고객센터" <help@yourservice.com>';
const default_acct = {
  host: "smtp.userdomain.com",
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: 'help@yourservice.com', // generated ethereal user
    pass: 'helpspasswd', // generated ethereal password
  },
};

module.exports = {
  send: async ({ from, to, subject, text, html }) => {

    let output = {
      errCode: ErrorCode.unknown,
      messageId: '',
    }

    if ( !to || !subject || (!text && !html) ) {
      console.log('!ERR mail send param missing')
      output.errCode = ErrorCode.Common.invalidParameter;

      return {...output};
    }

    try {
      from = from || default_from;

      // create reusable transporter object using the default SMTP transport
      let transporter = nodemailer.createTransport(default_acct);

      // send mail with defined transport object
      let info = await transporter.sendMail({
        from, // sender address
        to, // list of receivers
        subject, // Subject line
        text, // plain text body
        html, // html body
      });

      output.errCode = ErrorCode.success;
      output.messageId = info.messageId;

    } catch (e) {
      output.message = (e && e.response) || 'mail send fail';
      // console.log(e);
    }

    return {...output};
  }
}
