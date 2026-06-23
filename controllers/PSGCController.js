const path = require('path');
const fs = require('fs');

const BASE_DIR = path.join(__dirname, '..');
const PSGC_DIR = path.join(BASE_DIR, 'public', 'psgc');

function loadJson(filename) {
    const filePath = path.join(PSGC_DIR, filename);
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

const REGIONS = loadJson('regions.json');
const PROVINCES = loadJson('provinces.json');
const CITIES = loadJson('cities.json');
const BARANGAYS = loadJson('barangays.json');


// REGIONS
exports.regions = async (req, res) => {
    return res.json(REGIONS);
};


// PROVINCES
exports.provinces = async (req, res) => {

    const regionName = decodeURIComponent(req.params.region);

    const filtered = PROVINCES.filter(p =>
        p.region === regionName
    );
    return res.json(filtered);
};


// CITIES
exports.cities = async (req, res) => {

    const provinceName = decodeURIComponent(req.params.province);

    const filtered = CITIES.filter(c =>
        c.province === provinceName
    );

    return res.json(filtered);
};


// BARANGAYS
exports.barangays = async (req, res) => {

    const cityName = decodeURIComponent(req.params.city);

    const filtered = BARANGAYS.filter(b =>
        b.citymun === cityName
    );

    return res.json(filtered);
};