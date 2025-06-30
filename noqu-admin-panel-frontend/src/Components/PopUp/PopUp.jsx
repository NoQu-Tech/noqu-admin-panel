import React from 'react'
import "./PopUp.css"

const PopUp = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="PopUp-overlay">
    <div className="PopUp-content">
      {children}
      <button  onClick={onClose} className="PopUp-close-button scale-hover">Close</button>
    </div>
  </div>
  )
}

export default PopUp