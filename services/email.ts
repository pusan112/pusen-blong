/**
 * Email Service - 基于 EmailJS 的真实邮件发送服务
 * 请访问 https://www.emailjs.com/ 注册并获取相关参数
 */

// 声明全局 emailjs 变量（由 index.html 中的 SDK 注入）
declare const emailjs: any;

export const emailService = {
  /**
   * 发送验证码邮件
   * @param toEmail 接收者邮箱
   * @param code 6位验证码
   */
  async sendVerificationCode(toEmail: string, code: string): Promise<{ success: boolean; error?: any }> {
    try {
      // 已更新为用户提供的参数
      const serviceID = "service_qftcrsy";
      const templateID = "template_e4ny669";
      
      const templateParams = {
        to_email: toEmail,
        auth_code: code,
        expiry_time: "5 分钟",
        garden_name: "PUSEN - 数字花园"
      };

      const response = await emailjs.send(serviceID, templateID, templateParams);
      console.log('Email sent successfully!', response.status, response.text);
      return { success: true };
    } catch (error) {
      console.error('Failed to send email:', error);
      return { success: false, error };
    }
  }
};