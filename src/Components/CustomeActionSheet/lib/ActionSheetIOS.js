import {Component} from 'react';
import {ViewPropTypes} from 'prop-types';

import {ActionSheetIOS} from 'react-native';

const optionNames = [
  'title',
  'message',
  'options',
  'tintColor',
  'cancelButtonIndex',
  'destructiveButtonIndex',
  'anchor',
];

function isArray(obj) {
  return Object.prototype.toString.call(obj) === '[object Array]';
}

class ActionSheet extends Component {
  componentDidMount() {
    const {options} = this.props;

    if (!isArray(options) || options.length === 0) {
      throw Error('Prop `options` must be an array and it must not be empty.');
    }
  }

  show() {
    let props = this.props;

    let options = optionNames.reduce((obj, name, index) => {
      if (typeof props[name] !== 'undefined' && props[name] !== null) {
        obj[name] = props[name];
      }
      return obj;
    }, {});

    ActionSheetIOS.showActionSheetWithOptions(options, props.onPress);
  }

  render() {
    return null;
  }
}

ActionSheet.propTypes = {
  title: ViewPropTypes?.string,
  message: ViewPropTypes?.string,
  options: ViewPropTypes?.array,
  tintColor: ViewPropTypes?.string,
  cancelButtonIndex: ViewPropTypes?.number,
  destructiveButtonIndex: ViewPropTypes?.number,
  onPress: ViewPropTypes?.func,
  anchor: ViewPropTypes?.object,
};

ActionSheet.defaultProps = {
  onPress: () => {},
};

export default ActionSheet;
