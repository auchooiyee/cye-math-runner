# Physical-device QA — CYE Math Runner

This checklist requires a real phone or tablet. Browser viewport emulation does not verify touch latency, browser gestures, safe areas, or device rotation.

Record the device model, operating system, browser version, orientation, result, and a screenshot or short video for each failure. Test at least one Android phone, one iPhone, and one tablet if available.

| Check | Steps | Expected result |
| --- | --- | --- |
| Portrait layout | Open menu, mode selection, a run, gate, boss, and results in portrait | Text and answer buttons remain readable; no clipped controls or horizontal page scrolling |
| Landscape layout | Rotate on menu, during a run, and during a boss question | Canvas fits; no missing controls, duplicated overlays, or unintended answer |
| Swipes | In a run, swipe left, right, up, and down on the playfield | One lane move, jump, or slide per gesture; no accidental page scrolling |
| Touch controls | Tap each movement button repeatedly | One matching movement per tap, with usable touch targets |
| Gate answers | Enter a chapter practice run and tap each answer lane | Selected lane is highlighted and the intended answer is submitted once |
| Wrong gate answer | Deliberately choose a wrong lane | Feedback shows chosen answer, correct answer, hint, explanation, and working Continue button |
| Boss briefing | Clear site storage or use a fresh browser profile, then start Boss Training | First-time HP, wrong-answer, and phase instructions are readable and dismiss correctly |
| Boss answer buttons | Start Boss Training for Matrices and another chapter; submit correct and wrong answers | Exactly one answer registers; HP and shields change correctly; matrix notation stays aligned |
| Boss defeat | Finish Boss Training | Victory appears and results report the defeated boss |
| Results and retry | Review a mistake and start focused-topic practice | Review is readable and retry starts the selected topic |

After each rotation, try one answer button again. A portrait DOM button must not also activate the Phaser button underneath it.
