const InputOptions =(props)=> {
  return (
    <div className='flex justify-between items-center text-sm px-1 py-0.5'>
      <div className='flex'>{props.label}</div>
      <div className='flex pl-2 text'>
        <input type={props.type} defaultValue={props.value} className='border p-1 w-16 text-center' {...(props.type=='range'  && {min:props.min, max:props.max, step:props.step})}
          onChange={props.onChange}/>
      </div>
    </div>
  )
}

export default InputOptions