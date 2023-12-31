import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { defineMessages, injectIntl } from 'react-intl'
import ImmutablePureComponent from 'react-immutable-pure-component'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { changeSetting, saveSettings } from '../../actions/settings'
import ModalLayout from './modal_layout'
import Button from '../button'
import SettingSwitch from '../setting_switch'
import Text from '../text'

class ListTimelineSettingsModal extends ImmutablePureComponent {

  handleSaveAndClose = () => {
    this.props.onSave()
  }

  render() {
    const { intl, settings, onChange, onClose } = this.props

    return (
      <ModalLayout
        width={320}
        title={intl.formatMessage(messages.title)}
        onClose={onClose}
      >
      
        <div className={[_s.d, _s.pb10].join(' ')}>
          <SettingSwitch
            prefix='list_timeline'
            settings={settings}
            settingPath={['shows', 'polls']}
            onChange={onChange}
            label={intl.formatMessage(messages.showPolls)}
          />

          <SettingSwitch
            prefix='list_timeline'
            settings={settings}
            settingPath={['shows', 'photos']}
            onChange={onChange}
            label={intl.formatMessage(messages.showPhotos)}
          />

          <SettingSwitch
            prefix='list_timeline'
            settings={settings}
            settingPath={['shows', 'videos']}
            onChange={onChange}
            label={intl.formatMessage(messages.showVideos)}
          />

          <SettingSwitch
            prefix='list_timeline'
            settings={settings}
            settingPath={['shows', 'repost']}
            onChange={onChange}
            label={intl.formatMessage(messages.showReposts)}
          />

          <SettingSwitch
            prefix='list_timeline'
            settings={settings}
            settingPath={['shows', 'reply']}
            onChange={onChange}
            label={intl.formatMessage(messages.showReplies)}
          />
        </div>

        <Button
          backgroundColor='brand'
          color='white'
          className={_s.jcCenter}
          onClick={this.handleSaveAndClose}
        >
          <Text color='inherit' weight='bold' align='center'>
            {intl.formatMessage(messages.saveAndClose)}
          </Text>
        </Button>

      </ModalLayout>
    )
  }
}

const messages = defineMessages({
  title: { id: 'list_timeline_settings', defaultMessage: 'List Timeline Settings' },
  saveAndClose: { id: 'saveClose', defaultMessage: 'Save & Close' },
  showVideos: { id: 'home.column_settings.show_videos', defaultMessage: 'Show videos' },
  showPhotos: { id: 'home.column_settings.show_photos', defaultMessage: 'Show photos' },
  showPolls: { id: 'home.column_settings.show_polls', defaultMessage: 'Show polls' },
  showReposts: { id: 'home.column_settings.show_reposts', defaultMessage: 'Show comments' },
  showReplies: { id: 'home.column_settings.show_replies', defaultMessage: 'Show replies' },
})

const mapStateToProps = (state) => ({
  settings: state.getIn(['settings', 'list']),
})

const mapDispatchToProps = (dispatch, { onClose }) => ({
  onChange(key, checked) {
    dispatch(changeSetting(['list', ...key], checked))
  },
  onSave() {
    dispatch(saveSettings())
    onClose()
  },
})

ListTimelineSettingsModal.propTypes = {
  intl: PropTypes.object.isRequired,
  settings: ImmutablePropTypes.map.isRequired,
  onChange: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
}

export default injectInt(connect(mapStateToProps, mapDispatchToProps)(ListTimelineSettingsModal))
