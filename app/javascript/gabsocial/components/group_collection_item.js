import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import ImmutablePropTypes from 'react-immutable-proptypes'
import ImmutablePureComponent from 'react-immutable-pure-component'
import { NavLink } from 'react-router-dom'
import { defineMessages, injectIntl } from 'react-intl'
import { PLACEHOLDER_MISSING_HEADER_SRC, CX } from '../constants'
import { shortNumberFormat } from '../utils/numbers'
import Image from './image'
import Icon from './icon'
import Text from './text'
import GroupActionButton from './group_action_button'

class GroupCollectionItem extends ImmutablePureComponent {

  render() {
    const {
      intl,
      group,
      relationships,
      isHidden,
      isAddable,
    } = this.props

    if (!relationships) return null

    const isMember = relationships.get('member')
    const isAdmin = relationships.get('admin')
    const isModerator = relationships.get('moderator')
    const coverSrc = group.get('cover_image_thumbnail_url') || group.get('cover_image_medium_url') || group.get('cover_image_url') || ''
    const coverMissing = coverSrc.indexOf(PLACEHOLDER_MISSING_HEADER_SRC) > -1 || !coverSrc

    if (isHidden) {
      return (
        <React.Fragment>
          {group.get('title')}
          {isMember && intl.formatMessage(messages.member)}
          {isAdmin && intl.formatMessage(messages.admin)}
          {isModerator && intl.formatMessage(messages.moderator)}
        </React.Fragment>
      )
    }

    const navLinkClasses = CX({
      d: 1,
      noUnderline: 1,
      overflowHidden: 1,
      borderColorSecondary: 1,
      boxShadowBlock: 1,
      radiusSmall: 1,
      borderTop1PX: 1,
      mb10: 1,
      ml5: 1,
      mr5: 1,
      bgPrimary: 1,
      bgSubtle_onHover: isMember,
    })

    let groupTitle = group.get('title') || ''
    if (isAddable && groupTitle.length > 52) groupTitle = `${groupTitle.substring(0, 52).trim()}...`

    return (
      <div className={[_s.d, _s.w300PX].join(' ')}>
        <NavLink
          to={`/groups/${group.get('id')}`}
          className={navLinkClasses}
        >
          {
            !!coverSrc && !coverMissing &&
            <Image
              isLazy
              src={coverSrc}
              alt={group.get('title')}
              className={_s.h158PX}
            />
          }

          {
            (!coverSrc || coverMissing) && (isMember || isAdmin || isModerator) &&
            <div className={[_s.d, _s.h40PX, _s.bgSubtle, _s.borderColorSecondary, _s.borderBottom1PX].join(' ')} />
          }

          {
            (isMember || isAdmin || isModerator) &&
            <div className={[_s.d, _s.flexRow, _s.posAbs, _s.top0, _s.right0, _s.pt10, _s.mr10].join(' ')}>
              {
                isMember &&
                <Text
                  isBadge
                  className={_s.bgWhite}
                  size='extraSmall'
                  color='brand'
                >
                  {intl.formatMessage(messages.member)}
                </Text>
              }
              {
                isAdmin &&
                <Text
                  isBadge
                  className={[_s.bgBlack, _s.ml5].join(' ')}
                  size='extraSmall'
                  color='white'
                >
                  {intl.formatMessage(messages.admin)}
                </Text>
              }
              {
                isModerator &&
                <Text
                  isBadge
                  className={[_s.bgBlack, _s.ml5].join(' ')}
                  size='extraSmall'
                  color='white'
                >
                  {intl.formatMessage(messages.moderator)}
                </Text>
              }
            </div>
          }

          <div className={[_s.d, _s.px10, _s.my10].join(' ')}>
            <div className={[_s.d, _s.flexRow, _s.aiCenter].join(' ')}>
              <Text color='primary' size='medium' weight='bold'>
                {groupTitle}
              </Text>
              {
                group.get('is_verified') &&
                <Icon id='verified-group' size='14px' className={_s.ml5} />
              }
            </div>

            <div className={[_s.d, _s.flexRow, _s.aiCenter, _s.mt5, _s.mb5].join(' ')}>
              <Text color='secondary' size='small'>
                {shortNumberFormat(group.get('member_count'))}
                &nbsp;
                {intl.formatMessage(messages.members)}
              </Text>
            </div>

            {
              isAddable &&
              <div className={[_s.d, _s.pt10].join(' ')}>
                <GroupActionButton group={group} relationships={relationships} />
              </div>
            }
          </div>

        </NavLink>
      </div>
    )
  }

}

const messages = defineMessages({
  members: { id: 'groups.card.members', defaultMessage: 'Members' },
  viewGroup: { id: 'view_group', defaultMessage: 'View Group' },
  member: { id: 'member', defaultMessage: 'Member' },
  admin: { id: 'admin', defaultMessage: 'Admin' },
  moderator: { id: 'moderator', defaultMessage: 'Moderator' },
})

const mapStateToProps = (state, { id }) => ({
  group: state.getIn(['groups', id]),
  relationships: state.getIn(['group_relationships', id]),
})

GroupCollectionItem.propTypes = {
  group: ImmutablePropTypes.map,
  relationships: ImmutablePropTypes.map,
  isHidden: PropTypes.bool,
  isAddable: PropTypes.bool,
}

export default injectIntl(connect(mapStateToProps)(GroupCollectionItem))
