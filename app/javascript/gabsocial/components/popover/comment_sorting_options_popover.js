import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { defineMessages, injectIntl } from 'react-intl'
import { closePopover } from '../../actions/popover'
import { fetchComments, clearAllComments } from '../../actions/statuses'
import { changeSetting, saveSettings } from '../../actions/settings'
import {
  COMMENT_SORTING_TYPE_NEWEST,
  COMMENT_SORTING_TYPE_OLDEST,
  COMMENT_SORTING_TYPE_TOP,
} from '../../constants'
import PopoverLayout from './popover_layout'
import List from '../list'

class CommentSortingOptionsPopover extends React.PureComponent {

  handleOnClick = (type) => {
    this.props.onSetCommentSortingSetting(type)
  }

  handleOnClosePopover = () => {
    this.props.onClosePopover()
  }

  render() {
    const {
      commentSorting,
      intl,
      isXS,
    } = this.props

    const items = [
      {
        hideArrow: true,
        isActive: commentSorting === COMMENT_SORTING_TYPE_NEWEST,
        title: intl.formatMessage(messages.newest),
        subtitle: intl.formatMessage(messages.newestSubtitle),
        onClick: () => this.handleOnClick(COMMENT_SORTING_TYPE_NEWEST),
      },
      {
        hideArrow: true,
        isActive: commentSorting === COMMENT_SORTING_TYPE_OLDEST,
        title: intl.formatMessage(messages.oldest),
        subtitle: intl.formatMessage(messages.oldestSubtitle),
        onClick: () => this.handleOnClick(COMMENT_SORTING_TYPE_OLDEST),
      },
      {
        hideArrow: true,
        isActive: commentSorting === COMMENT_SORTING_TYPE_TOP,
        title: intl.formatMessage(messages.top),
        subtitle: intl.formatMessage(messages.topSubtitle),
        onClick: () => this.handleOnClick(COMMENT_SORTING_TYPE_TOP),
      },
    ]

    return (
      <PopoverLayout
        width={280}
        isXS={isXS}
        onClose={this.handleOnClosePopover}
      >
        <List
          size={isXS ? 'large' : 'small'}
          scrollKey='comment_sorting_options'
          items={items}
        />
      </PopoverLayout>
    )
  }
}

const messages = defineMessages({
  oldest: { id: 'comment_sort.oldest', defaultMessage: 'Oldest' },
  oldestSubtitle: { id: 'comment_sort.oldest.subtitle', defaultMessage: 'Show all comments, with the oldest comments first.' },
  newest: { id: 'comment_sort.newest', defaultMessage: 'Recent' },
  newestSubtitle: { id: 'comment_sort.newest.subtitle', defaultMessage: 'Show all comments, with the newest comments first.' },
  top: { id: 'comment_sort.top', defaultMessage: 'Most Liked' },
  topSubtitle: { id: 'comment_sort.top.subtitle', defaultMessage: 'Show all comments, with the most liked top-level comments first.' },
})

const mapStateToProps = (state) => ({
  commentSorting: state.getIn(['settings', 'commentSorting']),
})

const mapDispatchToProps = (dispatch, { statusId }) => ({
  onSetCommentSortingSetting(type) {
    dispatch(changeSetting(['commentSorting'], type))
    dispatch(saveSettings())
    dispatch(clearAllComments(statusId))
    dispatch(fetchComments(statusId, false, true))
    dispatch(closePopover())
  },
  onClosePopover: () => dispatch(closePopover()),
})

CommentSortingOptionsPopover.propTypes = {
  commentSorting: PropTypes.string.isRequired,
  intl: PropTypes.object.isRequired,
  isXS: PropTypes.bool,
  onClosePopover: PropTypes.func.isRequired,
  statusId: PropTypes.string.isRequired,
  onSetCommentSortingSetting: PropTypes.func.isRequired,
}

export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(CommentSortingOptionsPopover))