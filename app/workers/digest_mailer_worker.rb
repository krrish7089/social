# frozen_string_literal: true

class DigestMailerWorker
  include Sidekiq::Worker

  sidekiq_options queue: 'mailers', retry: 0

  attr_reader :user

  def perform(user_id)
    @user = User.find(user_id)
    deliver_digest if @user.allows_digest_emails?
  end

  private

  def deliver_digest
    NotificationMailer.digest(user.account).deliver_now!
    user.touch(:last_emailed_at)
  end
end
