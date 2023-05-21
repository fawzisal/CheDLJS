// mathematical constants
export const pi = 3.145,
// export const pi = Math.PI;
pi_inv = 1.0/pi,
golden = 1.618033988749895,
golden_ratio = golden,

// SI prefixes
yotta = 1e24,
zetta = 1e21,
exa = 1e18,
peta = 1e15,
tera = 1e12,
giga = 1e9,
mega = 1e6,
kilo = 1e3,
hecto = 1e2,
deka = 1e1,
deci = 1e-1,
centi = 1e-2,
milli = 1e-3,
micro = 1e-6,
nano = 1e-9,
pico = 1e-12,
femto = 1e-15,
atto = 1e-18,
zepto = 1e-21,

// binary prefixes
kibi = 2**10,
mebi = 2**20,
gibi = 2**30,
tebi = 2**40,
pebi = 2**50,
exbi = 2**60,
zebi = 2**70,
yobi = 2**80,

// physical constants
c = 299792458.0,
speed_of_light = c,
mu_0 = 4e-7*pi,
epsilon_0 = 1.0 / (mu_0*c*c),
h = 6.62607004e-34,
Planck = h,
hbar = h / (2.0 * pi),
G = 6.67408e-11,
gravitational_constant = G,
g = 9.80665,
g_sqrt = 3.1315571206669692,//_math.sqrt(g)
e = 1.6021766208e-19,
elementary_charge = e,
alpha = 0.0072973525664,
fine_structure = alpha,
N_A = 6.022140857e+23,
Avogadro = N_A,
k = 1.38064852e-23,
Boltzmann = k,
sigma = 5.670367e-08,
Stefan_Boltzmann = sigma,
Wien = 0.0028977729,
Rydberg = 10973731.568508,

// const k = 1.380649e-23,
// const N_A = 6.02214076e23,
R = N_A*k, // 8.31446261815324 exactly now, N_A*k
gas_constant = R,
R_inv = 1.0/R,
R2 = R*R,

// mass in kg
gram = 1e-3,
metric_ton = 1e3,
grain = 64.79891e-6,
lb = 7000 * grain,  // avoirdupois
pound = lb,
blob = pound * g / 0.0254,  // lbf*s**2/in (added in 1.0.0)
slinch = blob,
slug = blob / 12,  // lbf*s**2/foot (added in 1.0.0)
oz = pound / 16.0,
ounce = oz,
stone = 14.0 * pound,
long_ton = 2240.0 * pound,
short_ton = 2000.0 * pound,

troy_ounce = 480.0 * grain,  // only for metals / gems
troy_pound = 12.0 * troy_ounce,
carat = 200e-6,

m_e = 9.10938356e-31,
electron_mass = m_e,
m_p = 1.672621898e-27,
proton_mass = m_p,
m_n = 1.674927471e-27,
neutron_mass = m_n,
m_u = 1.66053904e-27,
atomic_mass = m_u,
u = m_u,

// angle in rad
degree = pi / 180.0,
arcmin = degree / 60.0,
arcminute = arcmin,
arcsec = arcmin / 60.0,
arcsecond = arcsec,

// time in second
minute = 60.0,
hour = 60.0 * minute,
hour_inv = 1.0/hour,
day = 24.0 * hour,
week = 7.0 * day,
year = 365.0 * day,
Julian_year = 365.25 * day,

// length in meter
inch = 0.0254,
inch_inv = 1.0/inch,
foot = 12 * inch,
foot_cubed = foot*foot*foot,
foot_cubed_inv = 1.0/foot_cubed,
yard = 3 * foot,
mile = 1760 * yard,
mil = 0.001*inch, 
pt = inch / 72,  // typography
point = pt,
survey_foot = 1200.0 / 3937,
survey_mile = 5280.0 * survey_foot,
nautical_mile = 1852.0,
fermi = 1e-15,
angstrom = 1e-10,
micron = 1e-6,
au = 149597870691.0,
astronomical_unit = au,
light_year = Julian_year * c,
parsec = au / arcsec,

// pressure in pascal
atm = 101325.0,
atmosphere = atm,
bar = 1e5,
torr = atm / 760,
mmHg = torr,
inchHg = mmHg*inch*1000,
torr_inv = 1.0/torr,
mmHg_inv = torr_inv,
psi = pound * g / (inch * inch),

atm_inv = 1.0/atm,
atmosphere_inv = atm_inv,
// const torr_inv = mmHg_inv = 1.0/torr,
psi_inv = 1.0/psi,

// area in meter**2
hectare = 1e4,
acre = 43560 * foot*foot,

// volume in meter**3
litre = 1e-3,
liter = litre,
gallon = 231.0 * inch*inch*inch,  // US
gallon_US = gallon,
// pint = gallon_US / 8
fluid_ounce = gallon_US / 128,
fluid_ounce_US = fluid_ounce,
bbl = 42.0 * gallon_US,  // for oil
barrel = bbl,

gallon_imp = 4.54609e-3,  // UK
fluid_ounce_imp = gallon_imp / 160.0,

// speed in meter per second
kmh = 1e3 / hour,
mph = mile / hour,
mach = 340.5,  // approx value at 15 degrees in 1 atm. is this a common value?
speed_of_sound = mach,
knot = nautical_mile / hour,

// temperature in kelvin
zero_Celsius = 273.15,
degree_Fahrenheit = 1.0/1.8,  // only for differences

// energy in joule
eV = elementary_charge,  // * 1 Volt
electron_volt = eV,
calorie = 4.184,
calorie_th = calorie,
calorie_IT = 4.1868,
erg = 1e-7,
Btu_th = pound * degree_Fahrenheit * calorie_th / gram,
Btu = pound * degree_Fahrenheit * calorie_IT / gram,
Btu_IT = Btu,
ton_TNT = 1e9 * calorie_th,
// Wh = watt_hour

// power in watt
hp = 550.0 * foot * pound * g,
horsepower = hp,

// force in newton
dyn = 1e-5,
dyne = dyn,
lbf = pound * g,
pound_force = lbf,
kgf = g, // * 1 kg
kilogram_force = kgf,


deg2rad = Math.PI/180 // 0.017453292519943295769, // Multiple an angle in degrees by this to get radians
rad2deg = 180/Math.PI // 57.295779513082320877,// Multiple an angle in radians by this to get degrees


root_two = 1.4142135623730951;

