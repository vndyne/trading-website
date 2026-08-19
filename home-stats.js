/* =================================
   HOME PAGE STATISTICS
================================= */

async function loadHomeStatistics() {
    const totalElement =
        document.getElementById(
            "home-total-recordings"
        );

    const audioElement =
        document.getElementById(
            "home-audio-recordings"
        );

    const videoElement =
        document.getElementById(
            "home-video-recordings"
        );

    const showsElement =
        document.getElementById(
            "home-total-shows"
        );

    const updatedElement =
        document.getElementById(
            "home-last-updated"
        );

    /*
        If the statistics section
        does not exist on this page,
        stop safely.
    */

    if (
        !totalElement ||
        !audioElement ||
        !videoElement ||
        !showsElement ||
        !updatedElement
    ) {
        return;
    }

    try {
        const response =
            await fetch(
                "./data/collection.json"
            );

        if (!response.ok) {
            throw new Error(
                `Could not load collection.json (${response.status})`
            );
        }

        const data =
            await response.json();

        const recordings =
            Array.isArray(data.items)
                ? data.items
                : [];

        /*
            TOTAL RECORDINGS
        */

        const totalRecordings =
            recordings.length;

        /*
            AUDIO
        */

        const audioRecordings =
            recordings.filter(
                recording =>
                    String(
                        recording.mediaType ||
                        ""
                    ).toLowerCase() ===
                    "audio"
            ).length;

        /*
            VIDEO
        */

        const videoRecordings =
            recordings.filter(
                recording =>
                    String(
                        recording.mediaType ||
                        ""
                    ).toLowerCase() ===
                    "video"
            ).length;

        /*
            UNIQUE SHOWS
        */

        const shows =
            new Set(
                recordings
                    .map(
                        recording =>
                            recording.show
                                ?.trim()
                    )
                    .filter(Boolean)
            );

        /*
            LAST UPDATED

            Find the newest updatedAt
            value in the collection.
        */

        const updateDates =
            recordings
                .map(
                    recording =>
                        recording.updatedAt
                )
                .filter(Boolean)
                .map(
                    value => {
                        /*
                            Some Encora dates can contain
                            more than 3 fractional-second
                            digits. Normalize them so
                            JavaScript can parse them
                            consistently.
                        */

                        const normalized =
                            String(value)
                                .replace(
                                    /\.(\d{3})\d*Z$/,
                                    ".$1Z"
                                );

                        return new Date(
                            normalized
                        );
                    }
                )
                .filter(
                    date =>
                        !Number.isNaN(
                            date.getTime()
                        )
                );

        let latestUpdate = null;

        if (
            updateDates.length > 0
        ) {
            latestUpdate =
                new Date(
                    Math.max(
                        ...updateDates.map(
                            date =>
                                date.getTime()
                        )
                    )
                );
        }

        /*
            DISPLAY NUMBERS
        */

        totalElement.textContent =
            totalRecordings.toLocaleString();

        audioElement.textContent =
            audioRecordings.toLocaleString();

        videoElement.textContent =
            videoRecordings.toLocaleString();

        showsElement.textContent =
            shows.size.toLocaleString();

        /*
            DISPLAY LAST UPDATED
        */

        if (latestUpdate) {
            updatedElement.textContent =
                latestUpdate.toLocaleString(
                    undefined,
                    {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                        hour: "numeric",
                        minute: "2-digit"
                    }
                );
        } else {
            updatedElement.textContent =
                "Unavailable";
        }

    } catch (error) {
        console.error(
            "Error loading homepage statistics:",
            error
        );

        totalElement.textContent =
            "—";

        audioElement.textContent =
            "—";

        videoElement.textContent =
            "—";

        showsElement.textContent =
            "—";

        updatedElement.textContent =
            "Unable to load";
    }
}


/* =================================
   START
================================= */

loadHomeStatistics();