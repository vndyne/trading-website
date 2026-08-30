let recordings = [];

const NFT_RECORDINGS = {

    // NFT until 2026-11-02
    2036681: "2026-11-02",

    // NFT forever
    1135878: true,

    // NFT forever
    1135843: true,

    // NFT forever
    1123507: true,

    // NFT forever
    1123508: true,

    // NFT forever
    2029720: true,

    // NFT forever
    2030946: true,

    // NFT until 2026-12-15
    2028358: "2026-12-15",

    // NFT forever
    2036585: true,

    // NFT until 2027-01-01
    2037419: "2027-01-01",

    // NFT until 2027-01-05
    2035164: "2027-01-05",

    // NFT forever
    2021401: true,

    // NFT forever
    2023127: true,

    // NFT forever
    2029946: true,

    // NFT until 2026-10-01
    2031062: "2026-10-01",

    // NFT until 2026-11-18
    2033150: "2026-11-18",

    // NFT forever
    2020036: true,

    // NFT forever
    2027058: true,

    // NFT forever
    1151353: true,

    // NFT forever
    2018539: true,

    // NFT forever
    2032930: true,

    // NFT forever
    2025260: true,

    // NFT forever
    2026279: true,

    // NFT until 2027-03-31
    2030894: "2027-03-31",

    // NFT forever
    2037179: true,

    // NFT forever
    2037180: true,

    // NFT forever
    2012222: true,

    // NFT until 2026-12-30
    2029978: "2026-12-30",

    // NFT forever
    2012225: true,

    // NFT until 2027-03-02
    2028961: "2027-03-02",

    // NFT until 2026-10-01
    2031061: "2026-10-01",

    // NFT until 2027-01-09
    2035534: "2027-01-09",

    // NFT forever
    2037461: true,

    // NFT forever
    2007882: true

};

const collectionContainer =
    document.getElementById("collection");

const statsContainer =
    document.getElementById("collection-stats");

const alphabetNav =
    document.getElementById("alphabet-nav");

const searchInput =
    document.getElementById("search");

const filterButtons =
    document.querySelectorAll(
        "[data-filter]"
    );

let currentFilter = "all";


/* ================================
   LOAD COLLECTION
================================ */

async function loadCollection() {

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


        /*
            IMPORTANT:

            Your Encora collection can contain
            the recording information inside
            item.recording.

            This keeps the existing top-level
            fields while also making the nested
            recording fields available.
        */

        recordings =
            (data.items || []).map(
                item => {

                    const nested =
                        item.recording || {};


                    return {

                        ...item,

                        ...nested,


                        /*
                            Keep the outer format
                            when available.
                        */

                        format:
                            item.format ??
                            nested.format ??
                            "",


                        /*
                            Keep outer notes when
                            available, otherwise
                            use recording notes.
                        */

                        notes:
                            item.notes ??
                            nested.notes ??
                            "",


                        /*
                            Metadata from Encora
                        */

                        mediaType:
                            nested.metadata?.media_type ??
                            item.mediaType ??
                            "",


                        recordingType:
                            nested.metadata?.recording_type ??
                            item.recordingType ??
                            "",


                        amountRecorded:
                            nested.metadata?.amount_recorded ??
                            item.amountRecorded ??
                            "",


                        venue:
                            nested.metadata?.venue ??
                            item.venue ??
                            "",


                        city:
                            nested.metadata?.city ??
                            item.city ??
                            "",


                        giftingStatus:
                            nested.metadata?.gifting_status ??
                            item.giftingStatus ??
                            "",


                        limitedStatus:
                            nested.metadata?.limited_status ??
                            item.limitedStatus ??
                            "",

                        nft:
                            NFT_RECORDINGS[item.id] === true
                                ? {
                                    nft_date: null,
                                    nft_forever: true
                                }
                                : NFT_RECORDINGS[item.id]
                                    ? {
                                        nft_date: NFT_RECORDINGS[item.id],
                                        nft_forever: false
                                    }
                                    : item.nft ?? nested.nft ?? null

                    };

                }
            );


        console.log(
            `Loaded ${recordings.length} recordings`
        );


        updateStatistics();

        updateAlphabetNavigation();

        displayCollection();


    } catch (error) {

        console.error(
            "Error loading collection:",
            error
        );


        collectionContainer.innerHTML = `

            <p class="error">

                Unable to load the collection.

            </p>

        `;

    }

}


/* ================================
   STATISTICS
================================ */

function updateStatistics() {

    const totalRecordings =
        recordings.length;


    const totalShows =
        new Set(

            recordings.map(
                recording =>

                    recording.show?.trim() ||
                    "Unknown Show"

            )

        ).size;


    statsContainer.innerHTML = `

        <strong>
            ${totalShows.toLocaleString()}
        </strong>
        shows

        <span>·</span>

        <strong>
            ${totalRecordings.toLocaleString()}
        </strong>
        recordings

    `;

}


/* ================================
   A-Z NAVIGATION
================================ */

function updateAlphabetNavigation() {

    const letters =
        new Set();


    recordings.forEach(
        recording => {

            const show =
                recording.show?.trim();


            if (!show) {
                return;
            }


            const firstLetter =
                show
                    .charAt(0)
                    .toUpperCase();


            if (
                firstLetter >= "A" &&
                firstLetter <= "Z"
            ) {

                letters.add(
                    firstLetter
                );

            }

        }
    );


    alphabetNav.innerHTML = "";


    const alphabet =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZ";


    alphabet
        .split("")
        .forEach(
            letter => {

                const button =
                    document.createElement(
                        "button"
                    );


                button.type =
                    "button";


                button.className =
                    "alphabet-button";


                button.textContent =
                    letter;


                if (
                    !letters.has(letter)
                ) {

                    button.disabled =
                        true;

                }


                button.addEventListener(
                    "click",
                    () => {

                        const target =
                            document.getElementById(
                                `letter-${letter}`
                            );


                        if (target) {

                            target.scrollIntoView({
                                behavior: "smooth",
                                block: "start"
                            });

                        }

                    }
                );


                alphabetNav.appendChild(
                    button
                );

            }
        );

}


/* ================================
   FILTER RECORDINGS
================================ */

function getFilteredRecordings() {

    const searchTerm =
        searchInput.value
            .trim()
            .toLowerCase();


    return recordings.filter(
        recording => {


            /*
                MEDIA FILTER
            */

            if (
                currentFilter !== "all" &&
                recording.mediaType
                    ?.toLowerCase() !==
                    currentFilter
            ) {

                return false;

            }


            /*
                SEARCH
            */

            if (searchTerm) {

                const castText =
                    getCastText(
                        recording
                    );


                const searchableText = [

                    recording.show,

                    recording.tour,

                    recording.master,

                    recording.mediaType,

                    recording.recordingType,

                    recording.format,

                    recording.notes,

                    castText

                ]
                    .filter(Boolean)
                    .join(" ")
                    .toLowerCase();


                if (
                    !searchableText.includes(
                        searchTerm
                    )
                ) {

                    return false;

                }

            }


            return true;

        }
    );

}


/* ================================
   GROUP BY SHOW
================================ */

function groupByShow(items) {

    const groups = {};


    items.forEach(
        recording => {

            const show =
                recording.show?.trim() ||
                "Unknown Show";


            if (!groups[show]) {

                groups[show] = [];

            }


            groups[show].push(
                recording
            );

        }
    );


    return groups;

}


/* ================================
   SORT SHOWS
================================ */

function sortShows(showNames) {

    return showNames.sort(
        (a, b) =>

            a.localeCompare(
                b,
                undefined,
                {
                    sensitivity:
                        "base"
                }
            )

    );

}


/* ================================
   SORT RECORDINGS
================================ */

function sortRecordings(items) {

    return items.sort(
        (a, b) => {

            const dateA =
                getSortableDate(
                    a.date
                );


            const dateB =
                getSortableDate(
                    b.date
                );


            return dateA.localeCompare(
                dateB
            );

        }
    );

}


/* ================================
   DISPLAY COLLECTION
================================ */

function displayCollection() {

    const filteredRecordings =
        getFilteredRecordings();


    const grouped =
        groupByShow(
            filteredRecordings
        );


    const showNames =
        sortShows(
            Object.keys(grouped)
        );


    collectionContainer.innerHTML =
        "";


    if (
        showNames.length === 0
    ) {

        collectionContainer.innerHTML = `

            <div class="no-results">

                <p>
                    No recordings found.
                </p>

            </div>

        `;

        return;

    }


    const fragment =
        document.createDocumentFragment();


    let currentLetter = "";


    showNames.forEach(
        showName => {


            const recordingsForShow =
                sortRecordings(
                    grouped[showName]
                );


            /*
                LETTER HEADING
            */

            const firstLetter =
                showName
                    .charAt(0)
                    .toUpperCase();


            if (
                firstLetter !==
                currentLetter
            ) {

                currentLetter =
                    firstLetter;


                const letterHeading =
                    document.createElement(
                        "div"
                    );


                letterHeading.className =
                    "letter-heading";


                letterHeading.id =
                    `letter-${firstLetter}`;


                letterHeading.innerHTML = `

                    <span>

                        ${escapeHTML(
                            firstLetter
                        )}

                    </span>

                `;


                fragment.appendChild(
                    letterHeading
                );

            }


            /*
                SHOW
            */

            const showArticle =
                document.createElement(
                    "article"
                );


            showArticle.className =
                "show-group";


            showArticle.innerHTML = `

                <button
                    class="show-header"
                    type="button"
                    aria-expanded="false"
                >

                    <div
                        class="show-title-area"
                    >

                        <h2>

                            ${escapeHTML(
                                showName
                            )}

                        </h2>

                    </div>


                    <div class="show-count">

                        ${
                            recordingsForShow.length
                        }

                        ${
                            recordingsForShow.length ===
                            1
                                ? "recording"
                                : "recordings"
                        }

                    </div>


                    <span
                        class="show-expand"
                    >
                        +
                    </span>

                </button>


                <div
                    class="show-recordings"
                >

                    <div
                        class="recording-list"
                    >
                    </div>

                </div>

            `;


            const recordingList =
                showArticle.querySelector(
                    ".recording-list"
                );


            /*
                RECORDINGS
            */

            recordingsForShow.forEach(
                recording => {

                    const recordingElement =
                        createRecordingElement(
                            recording,
                            showName
                        );


                    recordingList.appendChild(
                        recordingElement
                    );

                }
            );


            /*
                SHOW EXPAND / COLLAPSE
            */

            const showHeader =
                showArticle.querySelector(
                    ".show-header"
                );


            showHeader.addEventListener(
                "click",
                () => {

                    const isOpen =
                        showArticle.classList.contains(
                            "open"
                        );


                    showArticle.classList.toggle(
                        "open"
                    );


                    showHeader.setAttribute(
                        "aria-expanded",
                        String(!isOpen)
                    );

                }
            );


            fragment.appendChild(
                showArticle
            );

        }
    );


    collectionContainer.appendChild(
        fragment
    );

}


/* ================================
   CREATE RECORDING
================================ */

function createRecordingElement(
    recording,
    showName
) {

    const article =
        document.createElement(
            "article"
        );


    article.className =
        "recording";


    /*
        NFT

        The NFT information comes from
        recording.nft.
    */

    const nft =
        recording.nft || {};


    const nftDate =
        nft.nft_date;


    const nftForever =
        nft.nft_forever === true;


    const currentlyNFT =
        nftForever ||
        isFutureNFTDate(
            nftDate
        );


    if (currentlyNFT) {

        article.classList.add(
            "nft-recording"
        );

    }


    /*
        DATE
    */

    const formattedDate =
        formatRecordingDate(
            recording.date
        );


    /*
        CAST
    */

    const castText =
        getCastText(
            recording
        );


    /*
        TOUR / MASTER / FORMAT
    */

    const infoLine =
        [

            recording.tour,

            recording.master,

            recording.format

        ]
            .filter(Boolean)
            .map(
                escapeHTML
            )
            .join(
                " - "
            );


    /*
        NOTES
    */

    const notes =
        recording.notes ||
        "";


    /*
        NFT BADGE
    */

    const nftBadge =
        currentlyNFT
            ? `
                <span
                    class="nft-badge"
                >
                    NFT
                </span>
            `
            : "";


    /*
        RECORDING HTML
    */

    article.innerHTML = `

        <button
            class="recording-header"
            type="button"
            aria-expanded="false"
        >

            <div
                class="recording-main"
            >

                <h3>

                    ${escapeHTML(
                        formattedDate
                    )}

                </h3>


                <p>

                    ${
                        escapeHTML(
                            infoLine
                        )
                    }

                </p>

            </div>


            <div
                class="recording-header-right"
            >

                ${nftBadge}


                <span
                    class="expand-icon"
                >
                    +
                </span>

            </div>

        </button>


        <div
            class="recording-details"
        >


            <div
                class="recording-detail-inner"
            >


                <!-- TITLE -->

                <h2
                    class="recording-title"
                >

                    ${escapeHTML(
                        showName
                    )}

                </h2>


                <!-- DATE -->

                <div
                    class="recording-date"
                >

                    ${escapeHTML(
                        formattedDate
                    )}

                </div>


                <!-- TOUR / MASTER / FORMAT -->

                ${
                    infoLine
                        ? `

                            <div
                                class="
                                    recording-info-line
                                "
                            >

                                ${
                                    escapeHTML(
                                        infoLine
                                    )
                                }

                            </div>

                        `
                        : ""
                }


                <!-- CAST -->

                ${
                    castText
                        ? `

                            <div
                                class="
                                    recording-section
                                "
                            >

                                <h4>
                                    Cast
                                </h4>


                                <p
                                    class="
                                        cast-list
                                    "
                                >

                                    ${getCastHTML(
                                        recording
                                    )}

                                </p>

                            </div>

                        `
                        : ""
                }


                <!-- NOTES -->

                ${
                    notes
                        ? `

                            <div
                                class="
                                    recording-section
                                "
                            >

                                <h4>
                                    Notes
                                </h4>


                                <p
                                    class="
                                        recording-notes
                                    "
                                >

                                    ${escapeHTML(
                                        notes
                                    )}

                                </p>

                            </div>

                        `
                        : ""
                }


            </div>

        </div>

    `;


    /*
        RECORDING EXPAND / COLLAPSE
    */

    const header =
        article.querySelector(
            ".recording-header"
        );


    header.addEventListener(
        "click",
        () => {

            const isOpen =
                article.classList.contains(
                    "open"
                );


            article.classList.toggle(
                "open"
            );


            header.setAttribute(
                "aria-expanded",
                String(!isOpen)
            );

        }
    );


    return article;

}


/* ================================
   CAST FORMATTER
================================ */

function getCastText(
    recording
) {

    if (
        !Array.isArray(
            recording.cast
        )
    ) {

        return "";

    }


    return recording.cast
        .map(
            member => {

                const performer =
                    member
                        ?.performer
                        ?.name;


                const character =
                    member
                        ?.character
                        ?.name;


                const status =
                    member
                        ?.status
                        ?.abbreviation;


                if (!performer) {

                    return "";

                }


                /*
                    Example:

                    Miriam-Teak Lee (Juliet)

                    Alex Tranter (u/s Lance)
                */

                let text =
                    performer;


                const characterText =
                    character || "";


                if (
                    status &&
                    characterText
                ) {

                    text +=
                        ` (${status} ${characterText})`;

                }

                else if (
                    characterText
                ) {

                    text +=
                        ` (${characterText})`;

                }

                else if (
                    status
                ) {

                    text +=
                        ` (${status})`;

                }


                return text;

            }
        )
        .filter(Boolean)
        .join(", ");

}

/* ================================
   CAST HTML FORMATTER
================================ */

function getCastHTML(
    recording
) {
    if (
        !Array.isArray(
            recording.cast
        )
    ) {
        return "";
    }

    return recording.cast
        .map(
            member => {
                const performer =
                    member
                        ?.performer
                        ?.name;

                const character =
                    member
                        ?.character
                        ?.name;

                const status =
                    member
                        ?.status
                        ?.abbreviation;

                if (!performer) {
                    return "";
                }

                const performerText =
                    escapeHTML(
                        performer
                    );

                const characterText =
                    character
                        ? escapeHTML(
                            character
                        )
                        : "";

                const statusText =
                    status
                        ? escapeHTML(
                            status
                        )
                        : "";

                /*
                    Bold u/s cast members.

                    Example:
                    Alex Tranter (u/s Lance)
                */

                if (
                    status &&
                    status.toLowerCase() === "u/s" &&
                    characterText
                ) {
                    return `
                        <strong>
                            ${performerText}
                            (${statusText} ${characterText})
                        </strong>
                    `;
                }

                /*
                    Normal cast member with
                    character.
                */

                if (
                    characterText
                ) {
                    return `
                        ${performerText}
                        (${characterText})
                    `;
                }

                /*
                    Cast member with status
                    but no character.
                */

                if (
                    statusText
                ) {
                    return `
                        ${performerText}
                        (${statusText})
                    `;
                }

                return performerText;
            }
        )
        .filter(Boolean)
        .join(", ");
}


```js
/* ================================
   DATE FORMAT
================================ */

function formatRecordingDate(date) {
    if (!date) {
        return "Unknown date";
    }

    /*
        Encora date object.

        Encora may provide:
        - full date
        - month/year
        - year only

        We use Encora's known-date flags
        to determine what should be displayed.
    */
    if (typeof date === "object") {
        const fullDate = date.full_date;

        if (!fullDate) {
            return "Unknown date";
        }

        /*
            Only the year is known.
        */
        if (date.month_known === false) {
            return String(fullDate).slice(0, 4);
        }

        /*
            Month is known but day is unknown.
        */
        if (date.day_known === false) {
            return formatYearMonth(fullDate);
        }

        /*
            Day, month and year are known.
        */
        return formatFullDate(fullDate);
    }

    /*
        Date supplied as a string.
    */
    const value = String(date).trim();

    /*
        YYYY-MM-DD
        Full date.
    */
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return formatFullDate(value);
    }

    /*
        YYYY-MM
        Month and year only.
    */
    if (/^\d{4}-\d{2}$/.test(value)) {
        return formatYearMonth(value);
    }

    /*
        YYYY
        Year only.
    */
    if (/^\d{4}$/.test(value)) {
        return value;
    }

    return value;
}


/* ================================
   FULL DATE
================================ */

function formatFullDate(value) {
    const [
        year,
        month,
        day
    ] = value.split("-");

    const date = new Date(
        Number(year),
        Number(month) - 1,
        Number(day)
    );

    return date.toLocaleDateString(
        "en-US",
        {
            month: "short",
            day: "numeric",
            year: "numeric"
        }
    );
}


/* ================================
   YEAR / MONTH
================================ */

function formatYearMonth(value) {
    const [
        year,
        month
    ] = value.split("-");

    const date = new Date(
        Number(year),
        Number(month) - 1,
        1
    );

    return (
        date.toLocaleDateString(
            "en-US",
            {
                month: "short"
            }
        ) +
        ", " +
        year
    );
}
```

```


/* ================================
   SORTABLE DATE
================================ */

function getSortableDate(
    date
) {

    if (!date) {

        return "";

    }


    if (
        typeof date ===
        "object"
    ) {

        return (
            date.full_date ||
            ""
        );

    }


    return String(date);

}


/* ================================
   NFT DATE
================================ */

function isFutureNFTDate(
    nftDate
) {

    if (!nftDate) {

        return false;

    }


    const date =
        new Date(
            nftDate
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return false;

    }


    return date >=
        new Date();

}


/* ================================
   ESCAPE HTML
================================ */

function escapeHTML(
    value
) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


/* ================================
   FILTER EVENTS
================================ */

filterButtons.forEach(
    button => {

        button.addEventListener(
            "click",
            () => {

                filterButtons.forEach(
                    otherButton => {

                        otherButton.classList.remove(
                            "active"
                        );

                    }
                );


                button.classList.add(
                    "active"
                );


                currentFilter =
                    button.dataset.filter;


                displayCollection();

            }
        );

    }
);


/* ================================
   SEARCH EVENT
================================ */

searchInput.addEventListener(
    "input",
    () => {

        displayCollection();

    }
);


/* ================================
   START
================================ */

loadCollection();