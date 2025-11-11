function InputComponent({title,type,placeholder,refValue}: {title: string, type: string, placeholder: string, refValue: React.RefObject<HTMLInputElement|null>}) {
  return (
    <label>
        <span>{title}</span>
        <input type={type} placeholder={placeholder} ref={refValue} />
    </label>
  )
}

export default InputComponent