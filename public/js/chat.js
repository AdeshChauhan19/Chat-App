const socket = io()
//Elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')
//templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationMessageTemplate= document.querySelector('#location-message-template').innerHTML
const sidebarTemplate=document.querySelector('#sidebar-template').innerHTML
//options

const {username,room}=Qs.parse(location.search,{ignoreQueryPrefix:true}) 

//autoscroll
const autoscroll = () => {
    // New message element
    const $newMessage = $messages.lastElementChild

    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    // Visible height
    const visibleHeight = $messages.offsetHeight

    // Height of messages container
    const containerHeight = $messages.scrollHeight

    // How far have I scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}




//handling the user message
socket.on('message', (message) => {
    console.log(message)
    const html = Mustache.render(messageTemplate, {
        username:message.username,
        message:message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})
//close of user message

//handling the location url
socket.on('LocationMessage',(message)=>{
console.log(message.url)
const html=Mustache.render(locationMessageTemplate,{
    username:message.username,
    url:message.url,
    createdAt: moment(message.createdAt).format('h:mm a')
})
$messages.insertAdjacentHTML('beforeend',html)
autoscroll()
})
//close of location url message

//sidebar handle the room and number of user in room

socket.on('roomData',({room,users})=>{
   const html=Mustache.render(sidebarTemplate,{
       room,
       users
   })
document.querySelector('#sidebar').innerHTML=html
})

//handling the form
$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()

    //disable the submit button
    $messageFormButton.setAttribute('disabled', 'disabled')


    const message = e.target.elements.message.value

    socket.emit('sendMessage', message, (error) => {
        //enable the button
        $messageFormButton.removeAttribute('disabled')
        //clearing the inpur after the sending
        $messageFormInput.value = ''
        //for making the focus on input field
        $messageFormInput.focus()


        if (error) {
            return console.log(error)
        }

        console.log('Message delivered!')
    })
})

//handling the location link
$sendLocationButton.addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser.')
    }
    //disabling the sendLocationButton
    $sendLocationButton.setAttribute('disabled', 'disabled')

    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, () => {
            //enabling the button after clicking
            $sendLocationButton.removeAttribute('disabled')
            console.log('Location shared!')
        })
    })
})

//emiting event for to another
socket.emit('join',{username,room},(error)=>{
    if(error){
        alert(error)
        location.href='/'
    }
})