import {Fragment, useReducer, createContext, useEffect } from 'react'

import InputOptions from './components/InputOptions'

export const initialState = {data:[], config: {running: false, auto: true, delay: 400, increment_value: 1, limit_counter:0, stop_limit: '0', attempt_limit: 10}}
export const userContext = createContext(initialState);

export const stateReducer = (state, action) => {
  switch (action.type){
    case 'config':
      return {
        ...state, config: { ...state.config, ...state.config = action.payload }
      }
    case 'add':
      return {
        ...state, data: [ ...state.data = [...state.data, action.data]]
      }
    case 'delete':
      return {
        ...state, data: [ ...state.data = []],
      }
    default:
    break;
  }
}

const do_run =(props)=>{
  const state = props.state
  const dispatch = props.dispatch
  const data = state.data
  const config = state.config
  const input = props.target.previousElementSibling.querySelector('input')
  let value = input.value;
  const error_msg = props.target.parentElement.querySelector('.input-error');
  let on_error = false;
  error_msg.textContent = ''

  if(input.value===''){
    setTimeout(()=>{
      error_msg.textContent = 'Need you to give me some numbers for this to work'
    }, 100)
    on_error = true
  }
  if(!on_error && (config.increment_value === '' || config.increment_value === 0)){
    setTimeout(()=>{
      error_msg.textContent = 'Increment value can\'t be blank/0 for auto run'
    }, 100)
    on_error = true
  }
  if(!on_error && (config.stop_limit === '')){
    setTimeout(()=>{
      error_msg.textContent = 'Stop limit can\'t be blank for auto run'
    }, 100)
    on_error = true
  }
  if(!on_error && input.value==='0'){
    setTimeout(()=>{
      error_msg.textContent = 'Easy, It\'s a palindrome'
    }, 100)
    on_error = true

  }
  if(!on_error && data.length && data[data.length-1].input === input.value){
    setTimeout(()=>{
      error_msg.textContent = 'Try something different'
    }, 100)
    on_error = true
  }

  if(!on_error){
    let reversed, total, totalSplit;
    let attempting = false;
    let palindrome = false;
    let attempt_count = 0;
    let data_obj = {input:value, attempts:[], palindrome:palindrome}

    while(!attempting){
      reversed = do_reverse(value);
      total = do_total(value, reversed)
      totalSplit = total.split('');

      attempt_count++
      for(let i = 0; i < totalSplit.length; i++){
        if(totalSplit[i] !== totalSplit[(totalSplit.length-i)-1]) break;
        if(i === (totalSplit.length-1)){
          palindrome=true;
          attempting=true;
        }
      }
      data_obj.attempts.push({input: value, reversed: reversed, total: total, palindrome: palindrome})
      data_obj.palindrome = palindrome;
      if(attempt_count === config.attempt_limit) attempting = true
      value = total;
    }


    dispatch({type: 'add', data: data_obj})

    if(state.config.auto && (config.limit_counter < config.stop_limit || config.stop_limit === 0)){
      if(config.stop_limit) dispatch({type:'config', payload: {limit_counter: config.limit_counter++}})

      input.value=do_total(input.value, config.increment_value)
      setTimeout(()=>{
        do_run(props)
      }, config.delay)
    }else{
      setTimeout(()=>{
        do_stop({dispatch: dispatch, error: true})
      },0)
    }
  } else {
    setTimeout(()=>{
      do_stop({dispatch: dispatch, error: true})
    },0)
  }
}

const do_reverse = (a) =>{  return String(a).split('').reverse().join('') }
const do_total = (a, b) =>{ return String(BigInt(a)+BigInt(b)); /* global BigInt */ }

const do_stop = (props) =>{
  props.dispatch({type:'config', payload: {limit_counter: 0, running: false}})
  if(!props.error){
    var a = setTimeout(';');
    for (var i = 0 ; i < a ; i++) clearTimeout(i);
  }
}

const App =()=> {
  const [state, dispatch] = useReducer(stateReducer, initialState)

  useEffect(()=>{
    const list_result = document.querySelector('.list-result');
    if(list_result) list_result.scrollTop = list_result.scrollHeight;

    //fix mobile view not respecting declared screen size
    const main = document.querySelector('main')
    main.style.height = window.innerHeight+'px'

    console.log(state)
  }, [state])

  const data = state.data
  const config = state.config

  return (
    <userContext.Provider value = {{state, dispatch}}>
      <main className='flex flex-col h-screen max-w-screen-lg items-center mx-auto'>
        {/* Header */}
        <header className='flex p-8'>
          <div className='text-2xl'>
            Palindromic Numbers Checker
          </div>
        </header>

        {/* Controls */}
        <section className='flex flex-col md:flex-row h-full w-full'>
          <aside className='flex md:h-full md:basis-1/2 justify-center'>
            <div className='p-1'>

              {/* Explanation in header*/}
              <div className='border mb-1 p-1 text-center'>
                What is this?
              </div>

              {/* Control header */}
              <div className='max-w-sm mb-1'>
                {/* Input */}
                <div className='mb-1'>
                  <span className='text-sm text-scale-100'>Enter value here</span>
                  <input type='number' className='w-full border p-1 text-center' defaultValue='1'
                    onClick={(e)=>e.target.select()}/>
                </div>

                {/* Run Button */}
                <button className={'w-full border p-1 bg-sky-500 text-white hover:bg-sky-600'+(config.running?' hidden':'')}
                  onClick={(e)=>{
                    do_run({target:e.target, state:state, dispatch:dispatch});
                    dispatch({type:'config', payload: {running: true}})}}>
                  Run
                </button>

                {/* Stop Button */}
                <button className={'w-full border p-1 bg-red-500 text-white hover:bg-red-600'+(!config.running?' hidden':'')}
                  onClick={()=>{
                     do_stop({dispatch:dispatch});
                     dispatch({type:'config', payload: {running: false}})}}>
                  Stop
                </button>
                <div className='input-error text-red-500 border border-red-500 p-1 text-center mt-1 empty:hidden'/>
              </div>

              {/* Additional Options */}
              <div className={(config.running?' opacity-50 pointer-events-none select-none':'')+' flex flex-col justify-center p-1'}>
                <div className='flex flex-col p-1'>
                  <div>Additional Options</div>
                  <hr className='py-0.5'/>

                  {/* Attempt Limit */}
                  <InputOptions type='number' label='Attempt for (n) times' value={config.attempt_limit} onChange={(e)=> dispatch({type: 'config', payload: {attempt_limit: Number(e.target.value)}})}/>

                  {/* Auto Run */}
                  <div className='flex justify-between items-center text-sm p-1'>
                    <div className='flex'>{config.auto ? ' Disable' : 'Enable'} Auto Run</div>
                    <label className='relative inline-block w-14 h-6'>
                      <input type='checkbox' className='opacity-0 w-0 h-0 peer' defaultChecked={config.auto}
                        onClick={()=>dispatch({type: 'config', payload: {auto: !config.auto}})}
                      />
                      <span className='
                         absolute cursor-pointer inset-0 bg-slate-300 transition duration-500
                         before:absolute before:h-4 before:w-6 before:mt-1 before:ml-1 before:left before:bottom before:bg-white before:transition before:duration-500
                         peer-checked:bg-sky-500
                         peer-focus:box-shadow peer-focus:shadow-sky-500
                         peer-checked:before:translate-x-6'
                        />
                    </label>
                  </div>
                </div>

                {/* Auto Run Options*/}
                <div className={(config.auto ? 'flex' : 'hidden')+' flex-col border p-1'}>
                  <div>Auto Run Options</div>
                  <hr className='py-0.5'/>
                  <div className='flex flex-col'>
                    {/* Increment Value */}
                    <InputOptions type='number' label='Increment Value' value={config.increment_value} onChange={(e)=>dispatch({type: 'config', payload: {increment_value: Number(e.target.value)}})}/>
                    {/* Stop Limit */}
                    <InputOptions type='number' label='Stop after (n) Runs' value={config.stop_limit} onChange={(e)=>dispatch({type: 'config', payload: {stop_limit: Number(e.target.value)}})}/>
                    {/* Delay Input Range */}
                    <InputOptions type='range' label='Delay' value={config.delay} step='200' max='2000' min='0' onChange={(e)=>dispatch({type: 'config', payload: {delay: Number(e.target.value)}})}/>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* History */}
          {data.length > 0 &&
            <aside className='flex flex-col h-full w-full md:basis-1/2 px-8'>
              <div className='flex justify-center'>
                Run History
              </div>
                { data.length !== 0 &&
                  <div className='list-result flex h-full w-full border overflow-y-auto'>
                    <div className='flex flex-col h-0 text-sm w-full'>
                      {data.map((dat, i)=>
                        <Fragment key={i+'s'}>
                          {dat.attempts.map((attempt, i_)=>
                            <span key={i_+'s'} className={'text-white px-2 '+(attempt.palindrome ? 'bg-green-400 ':'bg-red-400')+(i_ !== dat.attempts.length-1 ? ' border-b':'')}>
                              {attempt.input} + {attempt.reversed} = {attempt.total}
                            </span>
                          )}
                            {dat.palindrome === true ?
                              <span className='bg-green-500 text-white w-full px-2'>
                                palindrome found in {dat.attempts.length} {dat.attempts.length ===  1 ?'attempt' : 'attempts'}
                              </span>
                            :
                              <span className='bg-red-500 text-white px-2'>
                                palindrome not found after {config.attempt_limit} attempts
                              </span>
                            }
                        </Fragment>
                      )}
                    </div>
                  </div>
                }
              <div className='flex w-full justify-center'>
                <span>
                  <button className='w-32 border p-1 mt-1 bg-red-500 text-white hover:bg-red-600'
                    onClick={()=> {
                      do_stop({dispatch: dispatch});
                      dispatch({type: 'delete'})
                    }}
                  >
                    Clear History
                  </button>
                </span>
              </div>
            </aside>
            }
        </section>

        {/* Footer */}
        <footer className='flex w-full justify-center'>
          <div className='px-5 py-1'>
            &copy; 2022 <a href='https://github.com/edxen' target='_blank' rel='noreferrer' className='underline'>edxen</a>
          </div>
        </footer>
      </main>
    </userContext.Provider>
  );
}

export default App;
