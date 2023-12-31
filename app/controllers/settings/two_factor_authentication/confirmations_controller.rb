# frozen_string_literal: true

module Settings
  module TwoFactorAuthentication
    class ConfirmationsController < BaseController
      layout 'admin'

      before_action :authenticate_user!
      before_action :ensure_otp_secret

      def new
        if !current_user.confirmed?
          flash[:alert] = "You must confirm your account before you can enable 2FA."
          redirect_to "/settings/profile"
        end
        prepare_two_factor_form
      end

      def create
        if current_user.validate_and_consume_otp!(confirmation_params[:code])
          flash[:notice] = I18n.t('two_factor_authentication.enabled_success')

          if params[:revoke_all_sessions] == '1'
            # the user clicked "Yes" to revoke other sessions
            sid = current_session.id
            current_user.forget_me!
            current_user.remember_me!
            current_user.session_activations.where.not(id: sid).destroy_all
          end

          current_user.otp_required_for_login = true
          @recovery_codes = current_user.generate_otp_backup_codes!
          current_user.save!

          render 'settings/two_factor_authentication/recovery_codes/index'
        else
          flash.now[:alert] = I18n.t('two_factor_authentication.wrong_code')
          prepare_two_factor_form
          render :new
        end
      end

      private

      def confirmation_params
        params.require(:form_two_factor_confirmation).permit(:code)
      end

      def prepare_two_factor_form
        @confirmation = Form::TwoFactorConfirmation.new
        @provision_url = current_user.otp_provisioning_uri(current_user.email, issuer: Rails.configuration.x.local_domain)
        @qrcode = RQRCode::QRCode.new(@provision_url)
      end

      def ensure_otp_secret
        redirect_to settings_two_factor_authentication_path unless current_user.otp_secret
      end
    end
  end
end
