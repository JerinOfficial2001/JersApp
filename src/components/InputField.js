import * as React from 'react';
import {TextInput} from 'react-native-paper';
import {MyContext} from '../../App';

const InputField = ({formData}) => {
  const {jersAppTheme} = React.useContext(MyContext);

  return (
    <TextInput
      multiline={formData.isBigInput}
      secureTextEntry={formData.isVisible}
      onChangeText={formData.onChange}
      label={formData.label}
      keyboardType={formData.type ? formData.type : 'default'}
      value={formData.value}
      outlineStyle={{
        borderColor: '#C3E0F0',
      }}
      textColor="black"
      theme={{
        colors: {primary: '#3683AF', placeholder: '#C3E0F0'},
      }}
      mode="outlined"
      style={{
        width: formData.width ? formData.width : '100%',
        backgroundColor: jersAppTheme.model,
        height: 50,
      }}
      right={<TextInput.Icon icon={() => formData.Icon} />}
      placeholder={formData.placeholder}
      placeholderTextColor={'#9796968a'}
    />
  );
};

export default InputField;
