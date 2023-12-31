import React from 'react'
import PropTypes from 'prop-types'
import { supportsPassiveEvents } from 'detect-it'

const MIN_SCALE = 1
const MAX_SCALE = 4

const getMidpoint = (p1, p2) => ({
  x: (p1.clientX + p2.clientX) / 2,
  y: (p1.clientY + p2.clientY) / 2,
})

const evtOpts = supportsPassiveEvents ? { passive: true } : false

const getDistance = (p1, p2) => {
  return Math.sqrt(Math.pow(p1.clientX - p2.clientX, 2) + Math.pow(p1.clientY - p2.clientY, 2))
}

const clamp = (min, max, value) => {
  return Math.min(max, Math.max(min, value))
}

class ZoomableImage extends React.PureComponent {

  state = {
    scale: MIN_SCALE,
  }

  removers = []
  container = null
  image = null
  lastTouchEndTime = 0
  lastDistance = 0

  componentDidMount () {
    let handler = this.handleTouchStart
    this.container.addEventListener('touchstart', handler, evtOpts)
    this.removers.push(() => this.container.removeEventListener('touchstart', handler))
    handler = this.handleTouchMove
    this.container.addEventListener('touchmove', handler, evtOpts)
    this.removers.push(() => this.container.removeEventListener('touchend', handler))
  }

  componentWillUnmount () {
    this.removeEventListeners()
  }

  removeEventListeners () {
    this.removers.forEach(listeners => listeners())
    this.removers = []
  }

  handleTouchStart = e => {
    if (e.touches.length !== 2) return

    this.lastDistance = getDistance(...e.touches)
  }

  handleTouchMove = e => {
    const { scrollTop, scrollHeight, clientHeight } = this.container
    if (e.touches.length === 1 && scrollTop !== scrollHeight - clientHeight) {
      // prevent propagating event to MediaModal
      e.stopPropagation()
      return
    }
    if (e.touches.length !== 2) return

    e.preventDefault()
    e.stopPropagation()

    const distance = getDistance(...e.touches)
    const midpoint = getMidpoint(...e.touches)
    const scale = clamp(MIN_SCALE, MAX_SCALE, this.state.scale * distance / this.lastDistance)

    this.zoom(scale, midpoint)

    this.lastMidpoint = midpoint
    this.lastDistance = distance
  }

  zoom(nextScale, midpoint) {
    const { scale } = this.state
    const { scrollLeft, scrollTop } = this.container

    // math memo:
    // x = (scrollLeft + midpoint.x) / scrollWidth
    // x' = (nextScrollLeft + midpoint.x) / nextScrollWidth
    // scrollWidth = clientWidth * scale
    // scrollWidth' = clientWidth * nextScale
    // Solve x = x' for nextScrollLeft
    const nextScrollLeft = (scrollLeft + midpoint.x) * nextScale / scale - midpoint.x
    const nextScrollTop = (scrollTop + midpoint.y) * nextScale / scale - midpoint.y

    this.setState({ scale: nextScale }, () => {
      this.container.scrollLeft = nextScrollLeft
      this.container.scrollTop = nextScrollTop
    })
  }

  handleClick = e => {
    // don't propagate event to MediaModal
    e.stopPropagation()
    const handler = this.props.onClick
    if (handler) handler()
  }

  handleOnLoad = () => {
    const { onLoad } = this.props
    !!onLoad && onLoad()
  }

  setContainerRef = c => {
    this.container = c
  }

  setImageRef = c => {
    this.image = c
  }

  render () {
    const { alt, src } = this.props
    const { scale } = this.state

    const overflow = scale === 1 ? 'hidden' : 'scroll'

    return (
      <div
        className={[_s.d, _s.w100PC, _s.h100PC, _s.aiCenter, _s.jcCenter].join(' ')}
        ref={this.setContainerRef}
        style={{ overflow }}
      >
        <img
          className={[_s.d, _s.objectFitContain, _s.hAuto, _s.wAuto, _s.maxW100PC, _s.maxH100PC].join(' ')}
          role='presentation'
          ref={this.setImageRef}
          alt={alt}
          title={alt}
          src={src}
          style={{
            transform: `scale(${scale})`,
            transformOrigin: '0 0',
          }}
          onClick={this.handleClick}
          onLoad={this.handleOnLoad}
          onError={this.handleOnLoad}
        />
      </div>
    )
  }

}

ZoomableImage.propTypes = {
  alt: PropTypes.string,
  src: PropTypes.string.isRequired,
  width: PropTypes.number,
  height: PropTypes.number,
  onClick: PropTypes.func,
}

ZoomableImage.defaultProps = {
  alt: '',
  width: null,
  height: null,
}

export default ZoomableImage