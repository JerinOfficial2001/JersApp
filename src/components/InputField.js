import * as React from 'react';
import {TextInput} from 'react-native-paper';

const InputField = () => {
  const [text, setText] = React.useState('');

  return (
    <TextInput
      style={{width: '100%'}}
      mode="outlined"
      label="Outlined input"
      placeholder="Type something"
      //   right={<TextInput.Affix text="/100" />}
    />
  );
};

export default InputField;
