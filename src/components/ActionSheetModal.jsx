import {View, Text} from 'react-native';
import React, {useContext, useEffect, useRef} from 'react';
import ActionSheet from 'react-native-actions-sheet';
import InputField from './InputField';
import {MyContext} from '../../App';

export default function ActionSheetModal({open, close}) {
  const {setuserData, jersAppTheme} = useContext(MyContext);

  const actionSheetRef = useRef(null);

  useEffect(() => {
    if (actionSheetRef.current) {
      if (open) {
        actionSheetRef.current?.show();
      } else {
        actionSheetRef.current?.hide();
      }
    }
  }, [open]);
  const inputFields = [
    {
      name: 'Name',
      label: 'Name',
      value: '',
      onChangeText: '',
      placeHolder: 'Name',
    },
  ];
  return (
    <ActionSheet
      onBeforeClose={() => {
        close(false);
      }}
      containerStyle={{backgroundColor: jersAppTheme.model}}
      ref={actionSheetRef}>
      <View
        style={{
          width: '100%',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 10,
        }}>
        <Text style={{fontSize: 20, fontWeight: 'bold'}}>ADD CONTACT</Text>

        {inputFields.map((elem, index) => {
          return <InputField key={index} formData={elem} />;
        })}
      </View>
    </ActionSheet>
  );
}
