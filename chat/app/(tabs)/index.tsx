import { Pressable, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Link } from 'expo-router';
import { authClient } from '@/utils/auth-client';
import { useAuth } from '@/contexts/auth-context';

const HomeScreen = () => {

  const pingBackend = async()=>{
    const res = await fetch("http://192.168.1.40:3000");
    const data = await res.text();
    console.log(data)
  }
  const {signOut} = useAuth()
 

  return (
    <View>
      <Pressable onPress={()=>signOut()}>
       <Text>Sign out</Text>
      </Pressable>

    </View>
  )
}

export default HomeScreen

const styles = StyleSheet.create({
  btn:{
    backgroundColor:"black",
    color:"white",
    borderRadius:10,
    padding:5
  }
})