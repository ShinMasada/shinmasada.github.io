(() => {
  const slides = [
    ['Class Cue', 'Class Cue title slide: Practice what you’re actually learning. Team: Christian Kim, Sara Gold, Shin Masada, Jamie Hsu, and Sam Willii.'],
    ['Meet Elizabeth', 'Core user persona: Elizabeth, a 16-year-old Spanish II student, wants quiz preparation and speaking confidence, but her language app does not match her class unit.'],
    ['How Class Cue works', 'Photograph a vocabulary list, practice those words in talk, spell, and quiz activities, and get specific feedback such as the missing accent in la estación.'],
    ['Unique value proposition', 'An AI-powered language-learning app concept that turns uploaded class materials into personalized listening, speaking, comprehension, and vocabulary exercises for middle and high school students.'],
    ['Market opportunity', 'Group pitch estimates: TAM approximately $425 million per year, SAM approximately $330 million per year, and SOM approximately $0.5–0.6 million, based on proposed pricing of about $36 per student per year.'],
    ['Competitive positioning', 'The group’s positioning map compares use of class-specific words and game-style practice, placing Class Cue in the high-engagement, class-specific corner.'],
    ['Feature comparison', 'The group’s proposed feature comparison covers uploaded materials, vocabulary exercises, listening comprehension, speaking with class vocabulary, and pronunciation feedback.'],
    ['Product vision', 'The vision moves from language classes to teacher-assigned practice, then to vocabulary-heavy subjects such as biology and history.'],
    ['Roadmap and business model', 'Proposed roadmap: build and test in months 0–9; grow with students in months 9–18; reach schools in years 3–5. Proposed tiers: free practice, premium at about $36 per year, and school licenses.'],
    ['Funding proposal', 'Pitch proposal: seek $4 million for an 18-month runway with seven people and a beta target at nine months. Allocation: $2.1 million team, $1 million product and technology, $500,000 marketing and partnerships, $300,000 operations and legal, and $100,000 unallocated.'],
  ];
  const select = document.getElementById('slide-select');
  const image = document.getElementById('deck-slide');
  const previous = document.getElementById('previous-slide');
  const next = document.getElementById('next-slide');
  let current = 0;
  slides.forEach(([title], i) => {
    const option = document.createElement('option');
    option.value = i;
    option.textContent = `${String(i + 1).padStart(2, '0')} · ${title}`;
    select.append(option);
  });
  function showSlide(index) {
    current = Math.max(0, Math.min(slides.length - 1, index));
    const number = String(current + 1).padStart(2, '0');
    const source = `assets/class-cue/slide-${number}.webp`;
    image.src = source;
    image.alt = slides[current][1];
    document.getElementById('slide-full').href = source;
    document.getElementById('slide-caption').textContent = `${number} / 10 · ${slides[current][0]}`;
    select.value = String(current);
    previous.disabled = current === 0;
    next.disabled = current === slides.length - 1;
  }
  previous.addEventListener('click', () => showSlide(current - 1));
  next.addEventListener('click', () => showSlide(current + 1));
  select.addEventListener('change', () => showSlide(Number(select.value)));
  document.querySelector('.deck-controls').hidden = false;
  showSlide(0);
})();
