document.addEventListener('DOMContentLoaded', function() {
    // Set the initial zoom level to 1, default setting
    let zoomLevel = 1;

    // Select the entire body as the content to zoom
    const content = document.body; 

    // Get the zoom-in button, zoom-out button and reset zoom button
    const zoomInBtn = document.getElementById('zoomIn');
    const zoomOutBtn = document.getElementById('zoomOut');
    const resetZoomBtn = document.getElementById('resetZoom');

    // Check if all the zoom buttons are present in the DOM
    if (zoomInBtn && zoomOutBtn && resetZoomBtn) {

        // Add click event listener to the zoom-in button
        zoomInBtn.addEventListener('click', function() {
            zoomLevel += 0.1;

            // Apply the zoom level to the content, set origin to the top left corner
            content.style.transform = 'scale(' + zoomLevel + ')';
            content.style.transformOrigin = '0 0';
        });

        // Add click event listener to the zoom-out button
        zoomOutBtn.addEventListener('click', function() {
            zoomLevel -= 0.1;

            // Apply the zoom level to the content, set origin to the top left corner
            content.style.transform = 'scale(' + zoomLevel + ')';
            content.style.transformOrigin = '0 0';
        });

        // Add click event listener to the reset zoom button
        resetZoomBtn.addEventListener('click', function() {
            zoomLevel = 1;

            // Apply the zoom level to the content, set origin to the top left corner
            content.style.transform = 'scale(' + zoomLevel + ')';
            content.style.transformOrigin = '0 0';
        });
    } else {
        // Log an error if any zoom button is missing
        console.error('Zoom buttons not found in the DOM');
    }
});
