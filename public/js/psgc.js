function initializePSGC(){
    const region = document.getElementById('region');
    const province = document.getElementById('province');
    const city = document.getElementById('city');
    const barangay = document.getElementById('barangay');

    fetch('/psgc/regions')
    .then(r => r.json())
    .then(data => {
        data.forEach(r => {
            //region.innerHTML += `<option value="${r.designation}">${r.name}</option>`;
        });
        region.innerHTML += `<option value="Region VI">Region VI</option>`;
    });

    region.onchange = () => {
        province.innerHTML = '<option>Select Province</option>';
        city.innerHTML = '<option>Select City</option>';
        barangay.innerHTML = '<option>Select Barangay</option>';
        province.disabled = city.disabled = barangay.disabled = true;

        if(!region.value) return;

        fetch(`/psgc/provinces/${region.value}`)
        .then(r => r.json())
        .then(data => {
            province.disabled = false;
            console.log(data);
            data.forEach(p => {
                //province.innerHTML += `<option value="${p.name}">${p.name}</option>`;
            });
            province.innerHTML += `<option value="Negros Occidental">Negros Occidental</option>`;
        });
    };

    province.onchange = () => {
        city.innerHTML = '<option>Select City</option>';
        barangay.innerHTML = '<option>Select Barangay</option>';
        city.disabled = barangay.disabled = true;

        if(!province.value) return;

        fetch(`/psgc/cities/${province.value}`)
        .then(r => r.json())
        .then(data => {
            city.disabled = false;
            data.forEach(c => {
                //city.innerHTML += `<option value="${c.name}">${c.name}</option>`;
            });
            city.innerHTML += `<option value="Moises Padilla">Moises Padilla</option>`;
        });
    };

    city.onchange = () => {
        barangay.innerHTML = '<option>Select Barangay</option>';
        barangay.disabled = true;

        if(!city.value) return;

        fetch(`/psgc/barangays/${city.value}`)
        .then(r => r.json())
        .then(data => {
            barangay.disabled = false;
            data.forEach(b => {
                barangay.innerHTML += `<option value="${b.name}">${b.name}</option>`;
            });
        });
    };
}