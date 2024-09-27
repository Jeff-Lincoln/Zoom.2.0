import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'

const StyledButton = ({ title, onPress, style,}: {
    title: String;
    onPress: () => void;
    style?: any;
}) => {
  return (
    <TouchableOpacity
    onPress={onPress}
    style={{
        backgroundColor: 'white',
        padding: 12,
        borderRadius: 5,
        width: "100%",
        ...style,
    }}>
        <Text
        style={{
          color:'#5F5DEC',
          fontSize: 16,
          fontWeight: 'bold',
          textAlign: 'center',
        }}>
            {title}
        </Text>
    </TouchableOpacity>
  )
}

export default StyledButton

const styles = StyleSheet.create({})