let pc = document.querySelectorAll('.pc');

pc.forEach( e => {
    e.addEventListener('click', () => {
    let id = e.getAttribute('id');
    console.log(typeof(id));
    window.location.href = `pc.html?id=${id}`
    });

});