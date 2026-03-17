import React from "react"

import maleAvatar from "../../assets/male-avtar.png"
import femaleAvatar from "../../assets/female-avtar.png"
import babyAvatar from "../../assets/baby-avtar.png"

const Avatar = ({ name, gender, age }) => {

 const getAvatar = () => {

  if(age <= 5){
   return babyAvatar
  }

  if(gender?.toLowerCase() === "female"){
   return femaleAvatar
  }

  return maleAvatar
 }

 return (

  <img
   src={getAvatar()}
   alt={name}
   className="w-12 h-12 rounded-full object-cover border-2 border-white shadow"
  />

 )

}

export default Avatar