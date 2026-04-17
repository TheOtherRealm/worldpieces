"""
World Pieces — Seed script.
Populates Redis with one realistic worked example per discipline.
Run from the backend directory:  python seed_examples.py
"""
import os
import json
import redis
import uuid
from datetime import datetime, timezone
from dotenv import load_dotenv

load_dotenv()

r = redis.Redis(
    host="10.0.0.90",
    username="admin",
    password=os.getenv("redis_password"),
    port=6379,
    decode_responses=True,
)

NOW = datetime.now(timezone.utc).isoformat()
SEED_AUTHOR_ID = "seed_author"
SEED_AUTHOR_NAME = "World Pieces Team"

EXAMPLES = [
    # ── 1. Quantum Physics ────────────────────────────────────────────────────
    {
        "discipline": "quantum_physics",
        "discipline_label": "Quantum Physics",
        "title": "Quantum Harmonic Oscillator: Energy Levels and Wave Functions",
        "slug": "quantum_harmonic_oscillator",
        "difficulty": "intermediate",
        "tags": ["wave function", "Schrödinger equation", "energy levels", "Hermite polynomials", "statistics"],
        "problem_summary": (
            "The quantum harmonic oscillator (QHO) is one of the most important exactly solvable "
            "models in quantum mechanics. It describes the vibrational modes of diatomic molecules, "
            "phonons in crystal lattices, and the quantisation of electromagnetic field modes. "
            "The problem is to find the discrete energy eigenvalues and the corresponding normalised "
            "wave functions for a particle of mass m confined in a parabolic potential V(x) = ½mω²x², "
            "and to visualise the probability density |ψₙ(x)|² for the first several quantum numbers n."
        ),
        "solution_explanation": (
            "The time-independent Schrödinger equation for the QHO is:\n\n"
            "  −(ℏ²/2m) d²ψ/dx² + ½mω²x²ψ = Eψ\n\n"
            "By introducing the dimensionless variable ξ = x/x₀ where x₀ = √(ℏ/mω) is the "
            "characteristic length, the equation reduces to:\n\n"
            "  d²ψ/dξ² + (2ε − ξ²)ψ = 0,   ε = E/ℏω\n\n"
            "The physically acceptable solutions require ε = n + ½ for non-negative integer n, "
            "giving the celebrated equally-spaced energy spectrum:\n\n"
            "  Eₙ = ℏω(n + ½),   n = 0, 1, 2, …\n\n"
            "The zero-point energy E₀ = ½ℏω is a direct consequence of the Heisenberg uncertainty "
            "principle: the particle cannot be at rest at the potential minimum.\n\n"
            "The normalised wave functions are expressed in terms of Hermite polynomials Hₙ(ξ):\n\n"
            "  ψₙ(x) = (1/√(2ⁿ n!)) · (mω/πℏ)^(1/4) · exp(−mωx²/2ℏ) · Hₙ(√(mω/ℏ) x)\n\n"
            "Statistically, the probability density |ψₙ(x)|² gives the likelihood of finding the "
            "particle at position x. For large n, the quantum distribution approaches the classical "
            "result (spending more time near the turning points), illustrating the correspondence principle.\n\n"
            "The code below uses scipy.special.hermite and numpy to compute and plot the first six "
            "energy levels and their probability densities, with the classical turning points marked."
        ),
        "python_code": '''"""
Quantum Harmonic Oscillator — Energy Levels and Wave Functions
World Pieces | Quantum Physics Example

Requirements:
    pip install numpy scipy matplotlib

Run in VS Code or Google Colab.
"""

import numpy as np
import matplotlib.pyplot as plt
from scipy.special import hermite
from math import factorial, sqrt, pi

# ── Physical parameters (SI units, but we work in dimensionless ξ) ────────────
hbar = 1.0          # ℏ = 1 (natural units)
m    = 1.0          # mass
omega = 1.0         # angular frequency
x0   = sqrt(hbar / (m * omega))   # characteristic length

# ── Grid ──────────────────────────────────────────────────────────────────────
xi = np.linspace(-5, 5, 1000)     # dimensionless coordinate ξ = x / x0
x  = xi * x0

# ── Wave function ψₙ(ξ) ──────────────────────────────────────────────────────
def psi(n, xi_arr):
    """Normalised QHO wave function for quantum number n."""
    Hn = hermite(n)
    norm = 1.0 / sqrt(2**n * factorial(n)) * (m * omega / (pi * hbar))**0.25
    return norm * np.exp(-xi_arr**2 / 2) * Hn(xi_arr)

# ── Energy levels ─────────────────────────────────────────────────────────────
N_levels = 6
energies = [(n + 0.5) * hbar * omega for n in range(N_levels)]

# ── Plot ──────────────────────────────────────────────────────────────────────
fig, axes = plt.subplots(1, 2, figsize=(14, 7))
fig.suptitle("Quantum Harmonic Oscillator", fontsize=16, fontweight="bold")

# Left: wave functions offset by energy level
ax1 = axes[0]
colors = plt.cm.viridis(np.linspace(0.15, 0.9, N_levels))
for n in range(N_levels):
    psi_n = psi(n, xi)
    ax1.plot(xi, psi_n + energies[n], color=colors[n], lw=1.8, label=f"n={n}")
    ax1.axhline(energies[n], color=colors[n], lw=0.6, ls="--", alpha=0.5)

# Potential V(ξ) = ½ξ² (dimensionless)
V = 0.5 * xi**2
ax1.plot(xi, V, "k-", lw=2, label="V(ξ) = ½ξ²")
ax1.set_xlim(-5, 5)
ax1.set_ylim(-0.2, 7.5)
ax1.set_xlabel("ξ = x / x₀", fontsize=12)
ax1.set_ylabel("Energy (ℏω) / Wave function", fontsize=12)
ax1.set_title("Wave Functions ψₙ(ξ) + Eₙ", fontsize=13)
ax1.legend(fontsize=9)
ax1.grid(alpha=0.3)

# Right: probability densities |ψₙ|²
ax2 = axes[1]
for n in range(N_levels):
    prob = psi(n, xi)**2
    ax2.plot(xi, prob + energies[n], color=colors[n], lw=1.8, label=f"n={n}")
    ax2.axhline(energies[n], color=colors[n], lw=0.6, ls="--", alpha=0.5)
    # Classical turning points: E = ½ξ²  →  ξ = ±√(2E)
    xi_turn = sqrt(2 * energies[n])
    ax2.axvline( xi_turn, color=colors[n], lw=0.8, ls=":", alpha=0.7)
    ax2.axvline(-xi_turn, color=colors[n], lw=0.8, ls=":", alpha=0.7)

ax2.plot(xi, V, "k-", lw=2, label="V(ξ)")
ax2.set_xlim(-5, 5)
ax2.set_ylim(-0.2, 7.5)
ax2.set_xlabel("ξ = x / x₀", fontsize=12)
ax2.set_ylabel("|ψₙ(ξ)|² + Eₙ", fontsize=12)
ax2.set_title("Probability Densities |ψₙ(ξ)|²", fontsize=13)
ax2.legend(fontsize=9)
ax2.grid(alpha=0.3)

plt.tight_layout()
plt.savefig("qho_wave_functions.png", dpi=150, bbox_inches="tight")
plt.show()

# ── Print energy table ────────────────────────────────────────────────────────
print("\\nQuantum Harmonic Oscillator — Energy Levels")
print(f"{'n':>4}  {'Eₙ / ℏω':>12}  {'Eₙ (eV, ω=10¹³ rad/s)':>24}")
hbar_eV = 6.582e-16   # ℏ in eV·s
omega_ex = 1e13       # example angular frequency
for n, E in enumerate(energies):
    E_eV = E * hbar_eV * omega_ex
    print(f"{n:>4}  {E:>12.4f}  {E_eV:>24.6e}")
''',
    },

    # ── 2. Biomechanical Engineering ──────────────────────────────────────────
    {
        "discipline": "biomechanical_engineering",
        "discipline_label": "Biomechanical Engineering",
        "title": "Inverse Dynamics of the Human Knee During Gait",
        "slug": "knee_inverse_dynamics_gait",
        "difficulty": "advanced",
        "tags": ["inverse dynamics", "gait analysis", "joint moment", "Newton-Euler", "musculoskeletal"],
        "problem_summary": (
            "During normal walking, the knee joint experiences complex loading patterns that "
            "are critical for understanding injury risk, prosthetic design, and rehabilitation "
            "planning. Inverse dynamics computes the net joint forces and moments from measured "
            "kinematics (motion capture) and external forces (force plate data) without requiring "
            "knowledge of individual muscle forces. This example solves the 2-D inverse dynamics "
            "problem for the knee during the stance phase of gait, computing the net knee flexion "
            "moment and the joint reaction force at each time step."
        ),
        "solution_explanation": (
            "The Newton-Euler equations of motion for a rigid body segment are:\n\n"
            "  ΣF = m·a_cm   (translational)\n"
            "  ΣM_cm = I_cm·α   (rotational)\n\n"
            "For the shank segment (tibia + fibula), we apply these equations in a distal-to-proximal "
            "sequence. The distal end of the shank is the ankle, where the ground reaction force (GRF) "
            "and ankle joint force/moment from the foot segment are known. The proximal end is the knee.\n\n"
            "Step 1 — Segment kinematics: Compute the linear acceleration of the shank's centre of mass "
            "and the angular acceleration of the segment from differentiated marker trajectories.\n\n"
            "Step 2 — Distal forces/moments: The ankle joint force and moment are obtained by first "
            "solving the foot segment (GRF is measured by the force plate).\n\n"
            "Step 3 — Knee joint force: By Newton's third law, the force at the knee is:\n\n"
            "  F_knee = m·a_cm − F_ankle − m·g\n\n"
            "Step 4 — Knee joint moment: Taking moments about the shank's centre of mass:\n\n"
            "  M_knee = I_cm·α − M_ankle − r_ankle × F_ankle − r_knee × F_knee\n\n"
            "The resulting knee flexion moment is normalised by body weight × height (N·m/kg) to allow "
            "comparison across subjects. The characteristic double-peak waveform during stance reflects "
            "the two loading peaks: weight acceptance and terminal stance push-off.\n\n"
            "The code below simulates synthetic gait data representative of a 70 kg adult walking at "
            "1.4 m/s and computes the knee flexion moment across the stance phase."
        ),
        "python_code": '''"""
Inverse Dynamics — Knee Flexion Moment During Gait
World Pieces | Biomechanical Engineering Example

Requirements:
    pip install numpy scipy matplotlib

Reference: Winter, D.A. (2009). Biomechanics and Motor Control of Human Movement (4th ed.)
"""

import numpy as np
import matplotlib.pyplot as plt
from scipy.signal import butter, filtfilt

# ── Subject and segment parameters ────────────────────────────────────────────
body_mass   = 70.0      # kg
body_height = 1.75      # m
g           = 9.81      # m/s²

# Shank segment (Winter 2009 regression coefficients)
shank_mass   = 0.0465 * body_mass          # kg
shank_length = 0.246 * body_height         # m
I_shank      = 0.0052 * body_mass * body_height**2  # kg·m² (about CoM)
shank_com_ratio = 0.433  # proximal fraction of shank length to CoM

# ── Synthetic gait data (stance phase, 0–60% gait cycle) ─────────────────────
n_frames = 101
t = np.linspace(0, 0.6, n_frames)          # time (s), stance ~0.6 s at 1.4 m/s

# Knee flexion angle (degrees) — typical stance phase waveform
knee_angle = (
    5 + 20 * np.sin(np.pi * t / 0.6)**2
    + 5 * np.sin(2 * np.pi * t / 0.3)
)

# Shank segment angle (degrees from vertical, positive = forward lean)
shank_angle_deg = -5 + 15 * t / 0.6
shank_angle = np.radians(shank_angle_deg)

# Ground reaction force (N) — vertical component (typical double-peak)
GRF_v = (
    body_mass * g * (
        1.2 * np.sin(np.pi * t / 0.6)
        + 0.15 * np.sin(2 * np.pi * t / 0.3 + 0.5)
    )
)
# Horizontal GRF (anterior-posterior)
GRF_h = body_mass * g * 0.15 * np.sin(2 * np.pi * t / 0.6)

# ── Low-pass filter (4th-order Butterworth, 12 Hz) ───────────────────────────
def lpf(data, cutoff=12, fs=n_frames / 0.6):
    b, a = butter(4, cutoff / (fs / 2), btype="low")
    return filtfilt(b, a, data)

shank_angle_f = lpf(shank_angle)

# ── Numerical differentiation ─────────────────────────────────────────────────
dt = t[1] - t[0]
shank_alpha = np.gradient(np.gradient(shank_angle_f, dt), dt)   # rad/s²

# CoM acceleration (simplified: assume CoM moves with shank)
a_com_x = np.gradient(np.gradient(shank_length * shank_com_ratio * np.sin(shank_angle_f), dt), dt)
a_com_y = np.gradient(np.gradient(shank_length * shank_com_ratio * np.cos(shank_angle_f), dt), dt)

# ── Inverse dynamics (2-D, sagittal plane) ────────────────────────────────────
# Ankle joint force (simplified: assume ankle moment ≈ 0 for this example)
F_ankle_x = GRF_h
F_ankle_y = GRF_v - shank_mass * g

# Knee joint force
F_knee_x = shank_mass * a_com_x - F_ankle_x
F_knee_y = shank_mass * (a_com_y + g) - F_ankle_y

# Moment arms (perpendicular distances from CoM to force lines)
r_ankle = shank_length * shank_com_ratio   # distance CoM to ankle
r_knee  = shank_length * (1 - shank_com_ratio)  # distance CoM to knee

# Net knee flexion moment (N·m) — positive = extensor
M_knee = (
    I_shank * shank_alpha
    - r_ankle * (F_ankle_x * np.cos(shank_angle_f) - F_ankle_y * np.sin(shank_angle_f))
    + r_knee  * (F_knee_x  * np.cos(shank_angle_f) - F_knee_y  * np.sin(shank_angle_f))
)

# Normalise by body weight × height
M_knee_norm = M_knee / (body_mass * body_height)

# ── Plot ──────────────────────────────────────────────────────────────────────
gait_cycle_pct = t / 0.6 * 60   # 0–60% (stance phase)

fig, axes = plt.subplots(2, 2, figsize=(13, 9))
fig.suptitle("Knee Inverse Dynamics During Gait — Stance Phase", fontsize=15, fontweight="bold")

axes[0, 0].plot(gait_cycle_pct, GRF_v / (body_mass * g), "b-", lw=2)
axes[0, 0].set_title("Vertical GRF (normalised by BW)")
axes[0, 0].set_ylabel("GRF / BW")
axes[0, 0].axhline(1.0, color="gray", ls="--", alpha=0.5)
axes[0, 0].grid(alpha=0.3)

axes[0, 1].plot(gait_cycle_pct, knee_angle, "g-", lw=2)
axes[0, 1].set_title("Knee Flexion Angle")
axes[0, 1].set_ylabel("Angle (degrees)")
axes[0, 1].grid(alpha=0.3)

axes[1, 0].plot(gait_cycle_pct, F_knee_y, "r-", lw=2, label="Vertical")
axes[1, 0].plot(gait_cycle_pct, F_knee_x, "m--", lw=2, label="Horizontal")
axes[1, 0].set_title("Knee Joint Reaction Force")
axes[1, 0].set_ylabel("Force (N)")
axes[1, 0].legend()
axes[1, 0].grid(alpha=0.3)

axes[1, 1].plot(gait_cycle_pct, M_knee_norm, "k-", lw=2.5)
axes[1, 1].axhline(0, color="gray", ls="--", alpha=0.5)
axes[1, 1].fill_between(gait_cycle_pct, M_knee_norm, 0,
                         where=(M_knee_norm > 0), alpha=0.25, color="blue", label="Extensor")
axes[1, 1].fill_between(gait_cycle_pct, M_knee_norm, 0,
                         where=(M_knee_norm < 0), alpha=0.25, color="red", label="Flexor")
axes[1, 1].set_title("Net Knee Flexion Moment (normalised)")
axes[1, 1].set_ylabel("Moment (N·m / kg·m)")
axes[1, 1].set_xlabel("Gait Cycle (%)")
axes[1, 1].legend()
axes[1, 1].grid(alpha=0.3)

for ax in axes.flat:
    ax.set_xlabel("Gait Cycle (%)")

plt.tight_layout()
plt.savefig("knee_inverse_dynamics.png", dpi=150, bbox_inches="tight")
plt.show()

print(f"Peak knee extensor moment: {M_knee_norm.max():.3f} N·m/kg·m")
print(f"Peak knee flexor moment:   {M_knee_norm.min():.3f} N·m/kg·m")
''',
    },

    # ── 3. Neuroscience ───────────────────────────────────────────────────────
    {
        "discipline": "neuroscience",
        "discipline_label": "Neuroscience",
        "title": "Hodgkin-Huxley Model: Action Potential Generation",
        "slug": "hodgkin_huxley_action_potential",
        "difficulty": "advanced",
        "tags": ["Hodgkin-Huxley", "action potential", "ion channels", "ODE", "neural dynamics"],
        "problem_summary": (
            "The Hodgkin-Huxley (HH) model is the foundational quantitative description of how "
            "voltage-gated ion channels produce action potentials in neurons. Originally derived "
            "from voltage-clamp experiments on the squid giant axon (1952), it describes the "
            "membrane potential dynamics as a function of sodium (Na⁺), potassium (K⁺), and "
            "leak conductances. The problem is to numerically integrate the four coupled ODEs "
            "of the HH model under a step current injection and reproduce the characteristic "
            "action potential waveform, including the refractory period and repetitive firing."
        ),
        "solution_explanation": (
            "The HH model describes the membrane as a capacitor in parallel with three conductance "
            "branches. The governing equation for the membrane potential V (mV) is:\n\n"
            "  C_m dV/dt = I_ext − g_Na·m³·h·(V − E_Na) − g_K·n⁴·(V − E_K) − g_L·(V − E_L)\n\n"
            "where C_m = 1 μF/cm² is the membrane capacitance, and the gating variables m, h, n "
            "each satisfy a first-order kinetic equation:\n\n"
            "  dx/dt = α_x(V)·(1−x) − β_x(V)·x\n\n"
            "The voltage-dependent rate functions α and β were fitted by Hodgkin and Huxley to "
            "experimental data at 6.3°C. The three gating variables represent:\n\n"
            "  m — Na⁺ activation (fast, 3rd power → cooperative opening)\n"
            "  h — Na⁺ inactivation (slow, shuts off Na⁺ current after depolarisation)\n"
            "  n — K⁺ activation (slow, 4th power → delayed rectifier)\n\n"
            "The action potential sequence: (1) depolarising stimulus opens Na⁺ channels rapidly "
            "(m rises); (2) Na⁺ influx causes explosive depolarisation to ~+40 mV; (3) Na⁺ "
            "inactivation (h falls) and K⁺ activation (n rises) repolarise the membrane; "
            "(4) K⁺ overshoot causes the afterhyperpolarisation; (5) slow K⁺ deactivation "
            "restores resting potential.\n\n"
            "The code integrates the system using scipy.integrate.solve_ivp with a dense output "
            "and plots V(t), the gating variables, and the individual ionic currents."
        ),
        "python_code": '''"""
Hodgkin-Huxley Model — Action Potential Generation
World Pieces | Neuroscience Example

Requirements:
    pip install numpy scipy matplotlib

Reference: Hodgkin & Huxley (1952) J. Physiol. 117:500–544
"""

import numpy as np
import matplotlib.pyplot as plt
from scipy.integrate import solve_ivp

# ── HH parameters (squid axon, 6.3°C) ────────────────────────────────────────
C_m  = 1.0     # μF/cm²
g_Na = 120.0   # mS/cm²
g_K  =  36.0   # mS/cm²
g_L  =   0.3   # mS/cm²
E_Na =  50.0   # mV (reversal potential)
E_K  = -77.0   # mV
E_L  = -54.387 # mV

# ── Gating variable rate functions ────────────────────────────────────────────
def alpha_m(V): return 0.1 * (V + 40) / (1 - np.exp(-(V + 40) / 10)) if abs(V + 40) > 1e-7 else 1.0
def beta_m(V):  return 4.0 * np.exp(-(V + 65) / 18)
def alpha_h(V): return 0.07 * np.exp(-(V + 65) / 20)
def beta_h(V):  return 1.0 / (1 + np.exp(-(V + 35) / 10))
def alpha_n(V): return 0.01 * (V + 55) / (1 - np.exp(-(V + 55) / 10)) if abs(V + 55) > 1e-7 else 0.1
def beta_n(V):  return 0.125 * np.exp(-(V + 65) / 80)

# ── Steady-state initial conditions at resting potential V0 = -65 mV ─────────
V0 = -65.0
m0 = alpha_m(V0) / (alpha_m(V0) + beta_m(V0))
h0 = alpha_h(V0) / (alpha_h(V0) + beta_h(V0))
n0 = alpha_n(V0) / (alpha_n(V0) + beta_n(V0))
y0 = [V0, m0, h0, n0]

# ── External current stimulus (step injection) ────────────────────────────────
def I_ext(t):
    """Step current: 10 μA/cm² from t=5 ms to t=30 ms."""
    return 10.0 if 5.0 <= t <= 30.0 else 0.0

# ── ODE system ────────────────────────────────────────────────────────────────
def hh_odes(t, y):
    V, m, h, n = y
    I = I_ext(t)
    dV = (I - g_Na * m**3 * h * (V - E_Na)
              - g_K  * n**4     * (V - E_K)
              - g_L             * (V - E_L)) / C_m
    dm = alpha_m(V) * (1 - m) - beta_m(V) * m
    dh = alpha_h(V) * (1 - h) - beta_h(V) * h
    dn = alpha_n(V) * (1 - n) - beta_n(V) * n
    return [dV, dm, dh, dn]

# ── Numerical integration ─────────────────────────────────────────────────────
t_span = (0, 50)    # ms
t_eval = np.linspace(*t_span, 5000)
sol = solve_ivp(hh_odes, t_span, y0, t_eval=t_eval, method="RK45",
                rtol=1e-8, atol=1e-10, dense_output=True)

t  = sol.t
V  = sol.y[0]
m  = sol.y[1]
h  = sol.y[2]
n  = sol.y[3]

# Ionic currents
I_Na = g_Na * m**3 * h * (V - E_Na)
I_K  = g_K  * n**4     * (V - E_K)
I_L  = g_L             * (V - E_L)
I_stim = np.array([I_ext(ti) for ti in t])

# ── Plot ──────────────────────────────────────────────────────────────────────
fig, axes = plt.subplots(3, 1, figsize=(12, 10), sharex=True)
fig.suptitle("Hodgkin-Huxley Model — Action Potential", fontsize=15, fontweight="bold")

axes[0].plot(t, V, "k-", lw=2)
axes[0].axhline(V0, color="gray", ls="--", alpha=0.5, label=f"Rest ({V0} mV)")
axes[0].fill_between(t, -80, V, where=(I_stim > 0), alpha=0.1, color="orange", label="Stimulus")
axes[0].set_ylabel("Membrane Potential (mV)", fontsize=11)
axes[0].set_title("Membrane Potential V(t)", fontsize=12)
axes[0].legend(fontsize=9)
axes[0].grid(alpha=0.3)
axes[0].set_ylim(-85, 55)

axes[1].plot(t, m, "b-",  lw=2, label="m  (Na⁺ activation)")
axes[1].plot(t, h, "r-",  lw=2, label="h  (Na⁺ inactivation)")
axes[1].plot(t, n, "g-",  lw=2, label="n  (K⁺ activation)")
axes[1].set_ylabel("Gating Variable", fontsize=11)
axes[1].set_title("Gating Variables m, h, n", fontsize=12)
axes[1].legend(fontsize=9)
axes[1].grid(alpha=0.3)
axes[1].set_ylim(-0.05, 1.05)

axes[2].plot(t, -I_Na, "b-",  lw=2, label="−I_Na (inward)")
axes[2].plot(t,  I_K,  "g-",  lw=2, label=" I_K  (outward)")
axes[2].plot(t,  I_L,  "m--", lw=1.5, label=" I_L  (leak)")
axes[2].axhline(0, color="gray", ls="--", alpha=0.5)
axes[2].set_ylabel("Current (μA/cm²)", fontsize=11)
axes[2].set_xlabel("Time (ms)", fontsize=11)
axes[2].set_title("Ionic Currents", fontsize=12)
axes[2].legend(fontsize=9)
axes[2].grid(alpha=0.3)

plt.tight_layout()
plt.savefig("hodgkin_huxley.png", dpi=150, bbox_inches="tight")
plt.show()

# ── Summary statistics ────────────────────────────────────────────────────────
ap_peak = V.max()
ap_time = t[V.argmax()]
print(f"Action potential peak:  {ap_peak:.1f} mV at t = {ap_time:.2f} ms")
print(f"Resting potential:      {V0} mV")
print(f"Overshoot amplitude:    {ap_peak - V0:.1f} mV")
''',
    },

    # ── 4. Material Science ───────────────────────────────────────────────────
    {
        "discipline": "material_science",
        "discipline_label": "Material Science",
        "title": "Pair Distribution Function of Amorphous Silica from MD Simulation",
        "slug": "pair_distribution_function_silica",
        "difficulty": "intermediate",
        "tags": ["pair distribution function", "amorphous", "silica", "molecular dynamics", "radial distribution"],
        "problem_summary": (
            "The pair distribution function (PDF), also called the radial distribution function g(r), "
            "is a fundamental structural descriptor for both crystalline and amorphous materials. "
            "It gives the probability of finding an atom at distance r from a reference atom, "
            "normalised by the ideal-gas density. For amorphous silica (a-SiO₂), the PDF reveals "
            "the short-range order: the first peak corresponds to the Si-O bond length (~1.62 Å), "
            "the second to O-O and Si-Si distances within a SiO₄ tetrahedron. This example "
            "computes and analyses the partial PDFs g_SiO(r), g_OO(r), and g_SiSi(r) from a "
            "simulated amorphous silica structure."
        ),
        "solution_explanation": (
            "The pair distribution function is defined as:\n\n"
            "  g_αβ(r) = V / (N_α · N_β) · Σᵢ Σⱼ δ(r − rᵢⱼ) / (4πr²Δr)\n\n"
            "where V is the simulation cell volume, N_α and N_β are the numbers of atoms of "
            "species α and β, and rᵢⱼ is the distance between atom i (type α) and atom j (type β).\n\n"
            "For a periodic simulation cell, minimum-image convention is applied: each distance "
            "is computed to the nearest periodic image of the target atom.\n\n"
            "The total PDF is the composition-weighted sum of partials:\n\n"
            "  G(r) = Σ_αβ c_α c_β b_α b_β g_αβ(r)\n\n"
            "where c_α is the atomic fraction and b_α is the neutron scattering length.\n\n"
            "Key structural features of a-SiO₂:\n"
            "  Si-O bond:  ~1.62 Å (first sharp peak)\n"
            "  O-O distance: ~2.65 Å (within tetrahedron)\n"
            "  Si-Si distance: ~3.12 Å (corner-sharing tetrahedra)\n"
            "  First sharp diffraction peak (FSDP): ~1.5 Å⁻¹ in S(Q), indicating medium-range order\n\n"
            "The code generates a model amorphous silica structure using random placement with "
            "minimum distance constraints (mimicking a quench from melt), then computes and plots "
            "the three partial PDFs."
        ),
        "python_code": '''"""
Pair Distribution Function of Amorphous Silica
World Pieces | Material Science Example

Requirements:
    pip install numpy scipy matplotlib

Note: This example generates a model a-SiO2 structure for demonstration.
For research, use actual MD trajectories (LAMMPS, VASP, CP2K output).
"""

import numpy as np
import matplotlib.pyplot as plt
from scipy.spatial.distance import cdist

np.random.seed(42)

# ── Simulation cell ────────────────────────────────────────────────────────────
# Amorphous SiO2: density ≈ 2.20 g/cm³, formula unit SiO2
# For 96-atom cell: 32 Si + 64 O
N_Si = 32
N_O  = 64
N    = N_Si + N_O

# Cell parameter from density
M_SiO2 = 60.08   # g/mol
rho     = 2.20    # g/cm³
N_A     = 6.022e23
V_cell  = (N / 3) * M_SiO2 / (rho * N_A) * 1e24   # Å³
L = V_cell**(1/3)   # Å (cubic cell)
print(f"Simulation cell: {L:.2f} Å³ cubic")

# ── Generate model structure (random with minimum distance constraints) ────────
def place_atoms(N_atoms, L, r_min, existing=None):
    """Place atoms randomly, rejecting positions closer than r_min to existing atoms."""
    positions = [] if existing is None else list(existing)
    max_attempts = 10000
    for _ in range(N_atoms):
        for attempt in range(max_attempts):
            pos = np.random.uniform(0, L, 3)
            if not positions:
                positions.append(pos)
                break
            dists = np.linalg.norm(
                np.array(positions) - pos
                - L * np.round((np.array(positions) - pos) / L), axis=1
            )
            if dists.min() > r_min:
                positions.append(pos)
                break
    return np.array(positions)

# Place Si atoms first, then O atoms
r_SiSi_min = 3.0   # Å
r_SiO_min  = 1.5   # Å
r_OO_min   = 2.4   # Å

pos_Si = place_atoms(N_Si, L, r_SiSi_min)
pos_O  = place_atoms(N_O,  L, r_OO_min, existing=None)
positions = np.vstack([pos_Si, pos_O])
types = np.array(["Si"] * N_Si + ["O"] * N_O)

# ── Minimum-image distance matrix ─────────────────────────────────────────────
def min_image_dist(pos_a, pos_b, L):
    """Compute pairwise distances with periodic boundary conditions."""
    delta = pos_a[:, np.newaxis, :] - pos_b[np.newaxis, :, :]
    delta -= L * np.round(delta / L)
    return np.sqrt((delta**2).sum(axis=-1))

# ── Compute partial PDFs ───────────────────────────────────────────────────────
r_max = L / 2
dr    = 0.05   # Å
r_bins = np.arange(0, r_max + dr, dr)
r_mid  = 0.5 * (r_bins[:-1] + r_bins[1:])

def compute_pdf(pos_a, pos_b, N_a, N_b, L, r_bins, same_species=False):
    """Compute partial g_αβ(r)."""
    dists = min_image_dist(pos_a, pos_b, L).flatten()
    if same_species:
        # Exclude self-pairs (diagonal)
        mask = dists > 1e-6
        dists = dists[mask]
    counts, _ = np.histogram(dists, bins=r_bins)
    r_mid_local = 0.5 * (r_bins[:-1] + r_bins[1:])
    dr_local = r_bins[1] - r_bins[0]
    shell_vol = 4 * np.pi * r_mid_local**2 * dr_local
    rho_ideal = N_b / L**3
    if same_species:
        norm = N_a * rho_ideal * shell_vol
    else:
        norm = N_a * rho_ideal * shell_vol
    g = counts / norm
    return g

g_SiO  = compute_pdf(pos_Si, pos_O,  N_Si, N_O,  L, r_bins)
g_OO   = compute_pdf(pos_O,  pos_O,  N_O,  N_O,  L, r_bins, same_species=True)
g_SiSi = compute_pdf(pos_Si, pos_Si, N_Si, N_Si, L, r_bins, same_species=True)

# ── Neutron-weighted total PDF ─────────────────────────────────────────────────
# Neutron scattering lengths: b_Si = 4.149 fm, b_O = 5.803 fm
b_Si = 4.149; b_O = 5.803
c_Si = N_Si / N; c_O = N_O / N
denom = (c_Si * b_Si + c_O * b_O)**2
w_SiO  = 2 * c_Si * c_O  * b_Si * b_O  / denom
w_OO   =     c_O  * c_O  * b_O  * b_O  / denom
w_SiSi =     c_Si * c_Si * b_Si * b_Si / denom
G_total = w_SiO * g_SiO + w_OO * g_OO + w_SiSi * g_SiSi

# ── Plot ──────────────────────────────────────────────────────────────────────
fig, axes = plt.subplots(2, 2, figsize=(13, 9))
fig.suptitle("Pair Distribution Functions — Amorphous SiO₂", fontsize=15, fontweight="bold")

for ax, g, label, color in zip(
    axes.flat,
    [g_SiO, g_OO, g_SiSi, G_total],
    ["g_SiO(r)", "g_OO(r)", "g_SiSi(r)", "G(r) — Neutron total"],
    ["royalblue", "tomato", "seagreen", "black"]
):
    ax.plot(r_mid, g, color=color, lw=2)
    ax.axhline(1.0, color="gray", ls="--", alpha=0.5, label="g = 1 (ideal gas)")
    ax.set_xlabel("r (Å)", fontsize=11)
    ax.set_ylabel("g(r)", fontsize=11)
    ax.set_title(label, fontsize=12)
    ax.set_xlim(0, 8)
    ax.legend(fontsize=9)
    ax.grid(alpha=0.3)

# Annotate expected peaks on g_SiO
axes[0, 0].axvline(1.62, color="orange", ls=":", lw=1.5, label="Si-O bond (1.62 Å)")
axes[0, 0].legend(fontsize=9)

plt.tight_layout()
plt.savefig("silica_pdf.png", dpi=150, bbox_inches="tight")
plt.show()

# ── Coordination number ────────────────────────────────────────────────────────
# Integrate g_SiO up to first minimum (~2.0 Å)
r_cut = 2.0
mask = r_mid < r_cut
rho_O = N_O / L**3
CN_Si = 4 * np.pi * rho_O * np.trapz(g_SiO[mask] * r_mid[mask]**2, r_mid[mask])
print(f"Si-O coordination number (r < {r_cut} Å): {CN_Si:.2f}  (expected: 4.0 for SiO4 tetrahedra)")
''',
    },

    # ── 5. Biophysics ─────────────────────────────────────────────────────────
    {
        "discipline": "biophysics",
        "discipline_label": "Biophysics",
        "title": "Protein Folding Thermodynamics: Two-State Model and Chevron Plot",
        "slug": "protein_folding_two_state_chevron",
        "difficulty": "advanced",
        "tags": ["protein folding", "two-state model", "chevron plot", "free energy", "statistical mechanics"],
        "problem_summary": (
            "Protein folding is one of the central problems in biophysics: how does a disordered "
            "polypeptide chain find its unique native structure on a biologically relevant timescale? "
            "For many small single-domain proteins, folding follows a two-state model: the protein "
            "exists in either the folded (F) or unfolded (U) state, with no stable intermediates. "
            "This example analyses the thermodynamics and kinetics of two-state folding using the "
            "chevron plot — a plot of the observed rate constant ln(k_obs) versus denaturant "
            "concentration [D] — which is the standard experimental tool for characterising "
            "folding/unfolding kinetics and extracting the folding free energy ΔG°_H₂O."
        ),
        "solution_explanation": (
            "In the two-state model, the equilibrium constant K_eq = [F]/[U] = k_f/k_u, where "
            "k_f and k_u are the folding and unfolding rate constants. The free energy of folding is:\n\n"
            "  ΔG°_fold = −RT ln(K_eq) = −RT ln(k_f/k_u)\n\n"
            "Under linear free energy relationship (LFER) assumptions, both rate constants depend "
            "exponentially on denaturant concentration [D]:\n\n"
            "  ln(k_f([D])) = ln(k_f^H₂O) − m_f · [D] / RT\n"
            "  ln(k_u([D])) = ln(k_u^H₂O) + m_u · [D] / RT\n\n"
            "where m_f and m_u are the kinetic m-values (sensitivity of the transition state to "
            "denaturant). The total m-value m = m_f + m_u is related to the change in solvent-"
            "accessible surface area (ΔSASA) between the unfolded and folded states.\n\n"
            "The observed rate constant in a stopped-flow experiment is:\n\n"
            "  k_obs = k_f([D]) + k_u([D])\n\n"
            "Plotting ln(k_obs) vs [D] gives the characteristic V-shaped chevron plot. The "
            "minimum of the chevron occurs at the midpoint [D]_m where k_f = k_u.\n\n"
            "The folding free energy in water is:\n\n"
            "  ΔG°_H₂O = RT · ln(k_f^H₂O / k_u^H₂O) = m · ([D]_m)\n\n"
            "The code fits a synthetic chevron dataset (with realistic noise) using scipy.optimize "
            "and extracts the thermodynamic and kinetic parameters."
        ),
        "python_code": '''"""
Protein Folding — Two-State Model and Chevron Plot Analysis
World Pieces | Biophysics Example

Requirements:
    pip install numpy scipy matplotlib

Reference: Jackson (1998) Fold. Des. 3:R81–R91
"""

import numpy as np
import matplotlib.pyplot as plt
from scipy.optimize import curve_fit

np.random.seed(2024)

# ── True parameters (representative of a 100-residue protein) ─────────────────
R       = 8.314e-3   # kJ/(mol·K)
T       = 298.0      # K
RT      = R * T      # kJ/mol

# Intrinsic rate constants in water (s⁻¹)
kf_H2O_true = 5000.0   # folding rate in water
ku_H2O_true = 0.005    # unfolding rate in water

# m-values (kJ/mol per M denaturant)
mf_true = 1.2    # folding arm slope
mu_true = 0.8    # unfolding arm slope

# ΔG°_H2O (kJ/mol)
dG_true = RT * np.log(kf_H2O_true / ku_H2O_true)
print(f"True ΔG°_H₂O = {dG_true:.2f} kJ/mol")
print(f"True [D]_m   = {dG_true / (mf_true + mu_true):.2f} M")

# ── Generate synthetic chevron data ───────────────────────────────────────────
D_conc = np.linspace(0, 8, 25)   # denaturant concentration (M)

def kf(D, kf0, mf):
    return kf0 * np.exp(-mf * D / RT)

def ku(D, ku0, mu):
    return ku0 * np.exp(+mu * D / RT)

def k_obs(D, kf0, ku0, mf, mu):
    return kf(D, kf0, mf) + ku(D, ku0, mu)

k_obs_true = k_obs(D_conc, kf_H2O_true, ku_H2O_true, mf_true, mu_true)
ln_kobs_true = np.log(k_obs_true)

# Add realistic noise (σ = 0.08 in ln space)
noise = np.random.normal(0, 0.08, len(D_conc))
ln_kobs_data = ln_kobs_true + noise

# ── Fit chevron model ──────────────────────────────────────────────────────────
def chevron_model(D, log_kf0, log_ku0, mf, mu):
    kf0 = np.exp(log_kf0)
    ku0 = np.exp(log_ku0)
    return np.log(k_obs(D, kf0, ku0, mf, mu))

p0 = [np.log(1000), np.log(0.01), 1.0, 0.5]
bounds = ([-np.inf, -np.inf, 0, 0], [np.inf, np.inf, 5, 5])
popt, pcov = curve_fit(chevron_model, D_conc, ln_kobs_data, p0=p0, bounds=bounds, maxfev=10000)
perr = np.sqrt(np.diag(pcov))

kf0_fit  = np.exp(popt[0]);  ku0_fit  = np.exp(popt[2 - 2 + 1])
mf_fit   = popt[2];          mu_fit   = popt[3]
kf0_fit  = np.exp(popt[0]);  ku0_fit  = np.exp(popt[1])
mf_fit   = popt[2];          mu_fit   = popt[3]

dG_fit  = RT * np.log(kf0_fit / ku0_fit)
m_total = mf_fit + mu_fit
Dm_fit  = dG_fit / m_total

# ── Plot ──────────────────────────────────────────────────────────────────────
D_fine = np.linspace(0, 8, 500)
ln_kf_fit = np.log(kf(D_fine, kf0_fit, mf_fit))
ln_ku_fit = np.log(ku(D_fine, ku0_fit, mu_fit))
ln_kobs_fit = chevron_model(D_fine, *popt)

fig, axes = plt.subplots(1, 2, figsize=(13, 6))
fig.suptitle("Two-State Protein Folding — Chevron Plot Analysis", fontsize=15, fontweight="bold")

# Chevron plot
ax1 = axes[0]
ax1.scatter(D_conc, ln_kobs_data, color="black", s=50, zorder=5, label="Simulated data")
ax1.plot(D_fine, ln_kobs_fit, "k-",  lw=2.5, label="Fit: ln(k_obs)")
ax1.plot(D_fine, ln_kf_fit,   "b--", lw=1.8, label="ln(k_f)")
ax1.plot(D_fine, ln_ku_fit,   "r--", lw=1.8, label="ln(k_u)")
ax1.axvline(Dm_fit, color="gray", ls=":", lw=1.5, label=f"[D]_m = {Dm_fit:.2f} M")
ax1.set_xlabel("Denaturant Concentration [D] (M)", fontsize=12)
ax1.set_ylabel("ln(k_obs)  [ln(s⁻¹)]", fontsize=12)
ax1.set_title("Chevron Plot", fontsize=13)
ax1.legend(fontsize=9)
ax1.grid(alpha=0.3)

# Free energy profile as function of [D]
ax2 = axes[1]
D_range = np.linspace(0, 8, 200)
dG_D = -RT * np.log(kf(D_range, kf0_fit, mf_fit) / ku(D_range, ku0_fit, mu_fit))
ax2.plot(D_range, dG_D, "purple", lw=2.5)
ax2.axhline(0, color="gray", ls="--", alpha=0.5)
ax2.axvline(Dm_fit, color="gray", ls=":", lw=1.5, label=f"[D]_m = {Dm_fit:.2f} M")
ax2.fill_between(D_range, dG_D, 0, where=(dG_D < 0), alpha=0.2, color="blue", label="Folded favoured")
ax2.fill_between(D_range, dG_D, 0, where=(dG_D > 0), alpha=0.2, color="red",  label="Unfolded favoured")
ax2.set_xlabel("Denaturant Concentration [D] (M)", fontsize=12)
ax2.set_ylabel("ΔG°_fold (kJ/mol)", fontsize=12)
ax2.set_title("Folding Free Energy vs [D]", fontsize=13)
ax2.legend(fontsize=9)
ax2.grid(alpha=0.3)

plt.tight_layout()
plt.savefig("chevron_plot.png", dpi=150, bbox_inches="tight")
plt.show()

# ── Results table ─────────────────────────────────────────────────────────────
print("\\n── Fitted Parameters ────────────────────────────────")
print(f"  k_f^H₂O  = {kf0_fit:>10.1f} s⁻¹   (true: {kf_H2O_true})")
print(f"  k_u^H₂O  = {ku0_fit:>10.4f} s⁻¹   (true: {ku_H2O_true})")
print(f"  m_f      = {mf_fit:>10.3f} kJ/mol/M  (true: {mf_true})")
print(f"  m_u      = {mu_fit:>10.3f} kJ/mol/M  (true: {mu_true})")
print(f"  ΔG°_H₂O  = {dG_fit:>10.2f} kJ/mol    (true: {dG_true:.2f})")
print(f"  [D]_m    = {Dm_fit:>10.2f} M          (true: {dG_true/(mf_true+mu_true):.2f})")
print(f"  m_total  = {m_total:>10.3f} kJ/mol/M  (true: {mf_true+mu_true:.1f})")
''',
    },
]


def seed():
    """Write all examples to Redis."""
    seeded = 0
    for ex in EXAMPLES:
        ex_id = str(uuid.uuid4())
        now = datetime.now(timezone.utc).isoformat()
        record = {
            "id": ex_id,
            "title": ex["title"],
            "slug": ex["slug"],
            "discipline": ex["discipline"],
            "discipline_label": ex["discipline_label"],
            "problem_summary": ex["problem_summary"],
            "solution_explanation": ex["solution_explanation"],
            "python_code": ex["python_code"],
            "tags": ex["tags"],
            "difficulty": ex["difficulty"],
            "author_id": SEED_AUTHOR_ID,
            "author_name": SEED_AUTHOR_NAME,
            "author_avatar": None,
            "colab_url": None,
            "created_at": now,
            "updated_at": now,
            "edit_history": [],
        }
        key = f"example:{ex_id}"
        r.json().set(key, ".", record)
        # Index by discipline
        r.sadd(f"discipline:{ex['discipline']}:examples", ex_id)
        # Global index
        r.sadd("examples:all", ex_id)
        print(f"  ✓ Seeded [{ex['discipline']}] {ex['title'][:60]}")
        seeded += 1

    print(f"\n{seeded} examples seeded successfully.")


if __name__ == "__main__":
    print("World Pieces — Seeding starter examples…\n")
    seed()
