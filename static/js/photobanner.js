//  document.addEventListener('DOMContentLoaded', () => {
  const photobanners = document.querySelectorAll('.photobanner-container');
 
  photobanners.forEach(banner => {
      const slidesContainer = banner.querySelector('.photobanner-slides');
      const slides = banner.querySelectorAll('.photobanner-slide');
      const prevButton = banner.querySelector('.photobanner-control.prev');
      const nextButton = banner.querySelector('.photobanner-control.next');
      const dotsContainer = banner.querySelector('.photobanner-dots');
      const dots = banner.querySelectorAll('.dot');

      let currentIndex = 0;
      const totalSlides = slides.length;

      if (totalSlides <= 1) {
          if (prevButton) prevButton.style.display = 'none';
          if (nextButton) nextButton.style.display = 'none';
          if (dotsContainer) dotsContainer.style.display = 'none';
          return; // No need for controls if 0 or 1 slide
      }

      function showSlide(index) {
          slides.forEach((slide, i) => {
              slide.classList.toggle('active', i === index);
          });
          if (dots.length > 0) {
              dots.forEach((dot, i) => {
                  dot.classList.toggle('active', i === index);
              });
          }
          currentIndex = index;
      }

      if (prevButton) {
          prevButton.addEventListener('click', () => {
              const newIndex = (currentIndex - 1 + totalSlides) % totalSlides;
              showSlide(newIndex);
          });
      }

      if (nextButton) {
          nextButton.addEventListener('click', () => {
              const newIndex = (currentIndex + 1) % totalSlides;
              showSlide(newIndex);
          });
      }

      if (dotsContainer) {
          dots.forEach(dot => {
              dot.addEventListener('click', (e) => {
                  const slideIndex = parseInt(e.target.getAttribute('data-slide'));
                  showSlide(slideIndex);
              });
          });
      }

      // Initialize the first slide
      showSlide(0);
  });


