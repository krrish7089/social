# frozen_string_literal: true
# == Schema Information
#
# Table name: polls
#
#  id              :bigint(8)        not null, primary key
#  account_id      :bigint(8)
#  status_id       :bigint(8)
#  expires_at      :datetime
#  options         :string           default([]), not null, is an Array
#  cached_tallies  :bigint(8)        default([]), not null, is an Array
#  multiple        :boolean          default(FALSE), not null
#  hide_totals     :boolean          default(FALSE), not null
#  votes_count     :bigint(8)        default(0), not null
#  last_fetched_at :datetime
#  created_at      :datetime         not null
#  updated_at      :datetime         not null
#  lock_version    :integer          default(0), not null
#

class Poll < ApplicationRecord
  include Expireable

  belongs_to :account
  belongs_to :status

  has_many :votes, class_name: 'PollVote', inverse_of: :poll, dependent: :destroy

  has_many :notifications, as: :activity, dependent: :destroy

  validates :options, presence: true
  validates :expires_at, presence: true, if: :local?
  validates_with PollValidator, on: :create, if: :local?

  scope :recent, -> { reorder(id: :desc) }
  scope :attached, -> { where.not(status_id: nil) }
  scope :unattached, -> { where(status_id: nil) }
  scope :most_voted, -> { reorder(votes_count: :desc) }
  scope :active, -> { where.not(expires_at: nil).where('expires_at >= ?', Time.now.utc) }
  scope :expired, -> { where.not(expires_at: nil).where('expires_at < ?', Time.now.utc) }

  before_validation :prepare_options
  before_validation :prepare_votes_count

  after_initialize :prepare_cached_tallies

  after_commit :reset_parent_cache, on: :update

  def cache_key
    "poll:#{id}-#{cache_version}"
  end

  def loaded_options
    options.map.with_index { |title, key| Option.new(self, key.to_s, title, show_totals_now? ? cached_tallies[key] : nil) }
  end

  def voted?(account)
    account.id == account_id || votes.where(account: account).exists?
  end

  delegate :local?, to: :account

  def remote?
    !local?
  end

  def emojis
    @emojis ||= CustomEmoji.from_text(options.join(' '))
  end

  class Option < ActiveModelSerializers::Model
    attributes :id, :title, :votes_count, :poll

    def initialize(poll, id, title, votes_count)
      @poll        = poll
      @id          = id
      @title       = title
      @votes_count = votes_count
    end
  end

  private

  def prepare_cached_tallies
    self.cached_tallies = options.map { 0 } if cached_tallies.empty?
  end

  def prepare_votes_count
    self.votes_count = cached_tallies.sum unless cached_tallies.empty?
  end

  def prepare_options
    self.options = options.map(&:strip).reject(&:blank?)
  end

  def reset_parent_cache
    return if status_id.nil?
    Rails.cache.delete("statuses/#{status_id}")
  end

  def show_totals_now?
    expired? || !hide_totals?
  end
end
