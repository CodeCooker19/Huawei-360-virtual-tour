console.log('app controller');

var isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

if (isMobile) {
    /* your code here */
    console.log('Device: is mobile');
    //$("#mobile").css('display', 'flex');
} else {
    console.log('Device: not mobile');
    //$("#mobile").css('display', 'none');
}

sessionStorage.clear();


$(window).on('load', function () {
    console.log("ready!");

    HideLoadingPage();
});

function isMobileDevice() {
    return (typeof window.orientation !== "undefined") || (navigator.userAgent.indexOf('IEMobile') !== -1);
}

//console.log = function() {}

// Project references
var projectObj;
var projectId;
var scenes;

// Fade duration
var fadeDuration = 450;

// Basic scene references
var scene = document.querySelector('a-scene');
var background = document.querySelector('a-sky');
var cameraRig = document.querySelector('#rig');
var assets;

var descriptionBox = document.getElementById('movingbox');

var textDescription = document.getElementById('text-description');

var videoDescription = document.getElementById('video-description');

var imageDescription = document.getElementById('image-description');

var modelDescription = document.getElementById('model-description');

$("#movingbox").addClass('box-hidden');
$("#movingbox").removeClass('box-visible');

document.addEventListener('mousemove', OnMouseMove);

/*
lightGallery(document.getElementById('lightgallery'), {    
    thumbnail:true,
    loadYoutubeThumbnail: true,
    youtubeThumbSize: 'default',
    videojs: true
}); 
*/

const Item = ({
    type,
    title,
    url,
    category,
    thumbnailUrl,
}) => `
    <li class="sidebar-item" category="${category}">
        <button type="button" class="btn btn-link h-100 w-100 text-left p-3 px-5 sidebar-button"
                id='${title.replace(/\s+/g, '-').replace(/\+/g, "_").replace(/:\s*/g, "_").replace(/,/g, '-')}' onclick="LoadMedia(event, '${type}','${title}','${url}', '${thumbnailUrl}')"">
            <div class="item-title">${type}</div>
            <div class="select-option">
                <div class="check"><div class="inside"></div></div>
            </div>
            <div class="item-description">${title}</div>

        </button>
    </li>
`;

const Folder = ({
    folderId,
    folderName,
    folderCollapse,
    folderContainerId,
    category
}) => `
    <div id="${folderId}" class="w-100 sidebar-folder" category="${category}">
        <div class="card border-0">
            <div class="card-header p-0 sidebar-folder-header border-0" id="headingOne">
                <button class="btn w-100 h-100 text-left sidebar-folder-btn px-5" data-toggle="collapse" data-target="#${folderCollapse}" aria-expanded="true" aria-controls="collapseOne">
                    ${folderName}
                    <i class="fa fa-chevron-down pull-right rotate-180" aria-hidden="true" id="${folderId}-dropdown"></i>
                </button>
            </div>

            <div id="${folderCollapse}" class="collapse show pl-4" aria-labelledby="headingOne" data-parent="#${folderId}">
                <div class="card-body p-0 collapse-box" id=${folderContainerId}>
                </div>
            </div>
        </div>
    </div>
`;

function OnMouseMove(e) {
    //console.log((descriptionBox.clientWidth / 2) + ',' + (descriptionBox.clientHeight / 2));

    descriptionBox.style.left = e.clientX - (descriptionBox.clientWidth / 2) + "px";
    descriptionBox.style.top = e.clientY - (descriptionBox.clientHeight * 2) + "px";
}

//Hide all container
HideAllContainer();

function HideAllContainer() {
    // Hide feedback container
    HideFeedbackContainer();

    // Hide minimap
    $("#mobile-minimap-container").removeClass("visible");
    $("#mobile-minimap-container").addClass("hidden");
    $("#minimap-container").removeClass("visible");
    $("#minimap-container").addClass("hidden");

    // Hide scanner
    HideScannerContainer();

    // Hide media gallery
    HidePartnersContainer();
}

$("#partner").collapse('hide');
$("#partners-logos").collapse('show');

var isShowingPartnersDescription = false;

function OnPartnerSelect(partner) {
    console.log('select partner');
    $("#partner").collapse('show');

    $("#partners-logos").collapse('hide');

    isShowingPartnersDescription = true;

    var height = $('.partners-overlay').scrollTop();

    if (height > 0) {
        $('.partners-overlay').animate({
            scrollTop: (0)
        }, 500);
    }

    switch (partner) {
        case "NEOLIX":
            var description = "Co-study, research, test and development of 5G V2X application in mobile vehicles and robots";

            $("#partners-title").html("NEOLIX");
            $("#partner-image").attr("src", "https://obs.ap-southeast-3.myhuaweicloud.com/hiverlabtest/huawei-virtualtour/ui/logos/neolix_logo.png");
            $("#partner-description").html(description);

            $("#partner-link").attr("value", "www.neolix.ai");
            $(".clipboard-btn").attr("data-clipboard-text", "www.neolix.ai");
            break;
        case "OTSAW":
            var description = "Co-study, research, test and development of 5G V2X application in mobile vehicles and robots";

            $("#partners-title").html("OTSAW");
            $("#partner-image").attr("src", "https://obs.ap-southeast-3.myhuaweicloud.com/hiverlabtest/huawei-virtualtour/ui/logos/otsaw_logo.png");
            $("#partner-description").html(description);

            $("#partner-link").attr("value", "www.otsaw.com");
            $(".clipboard-btn").attr("data-clipboard-text", "www.otsaw.com");
            break;
        case "MIROBOTIC":
            var description = "▪ To measure the connectivity of robots with clouds<br>▪ To improve robots respond speed<br>▪ To improve video lag issue";

            $("#partners-title").html("MIROBOTIC");
            $("#partner-image").attr("src", "https://obs.ap-southeast-3.myhuaweicloud.com/hiverlabtest/huawei-virtualtour/ui/logos/mirobotic_logo.png");
            $("#partner-description").html(description);

            $("#partner-link").attr("value", "www.mirobotic.sg");
            $(".clipboard-btn").attr("data-clipboard-text", "www.mirobotic.sg");
            break;
        case "HIVERLAB":
            var description = "▪ Jointly design, develop, verification of 5G enhanced Immersive experience use cases within Huawei AI Lab<br>▪ 5G AR/Drone live broadcast in Chingay parade 2020, Singapore<br>▪ Virtual AI Lab Design";

            $("#partners-title").html("HIVERLAB");
            $("#partner-image").attr("src", "https://obs.ap-southeast-3.myhuaweicloud.com/hiverlabtest/huawei-virtualtour/ui/logos/hiverlab_logo.png");
            $("#partner-description").html(description);

            $("#partner-link").attr("value", "www.hiverlab.com");
            $(".clipboard-btn").attr("data-clipboard-text", "www.hiverlab.com");
            break;
        case "DIGI":
            var description = "▪ DIGI electronic scale integrated with Atlas 200 for AI inference<br>▪ The world's first intelligent electronic scale with automatic produce recognition for ultimate user experience";

            $("#partners-title").html("DIGI");
            $("#partner-image").attr("src", "https://obs.ap-southeast-3.myhuaweicloud.com/hiverlabtest/huawei-virtualtour/ui/logos/digi_logo.png");
            $("#partner-description").html(description);

            $("#partner-link").attr("value", "www.digisystem.com/sg");
            $(".clipboard-btn").attr("data-clipboard-text", "www.digisystem.com/sg");
            break;
        case "TUSHENG":
            var description = "▪ Tusheng, an advanced data mining company powered by AI technology, has collaborated with Huawei on cloud storage and computing business.<br>▪ Tusheng has shared its AI technology in data mining with Huawei and will jointly develop AI data mining technology with Huawei in the future.<br>▪ Tusheng believes that Huawei will continue providing high-quality services and products and keep the leading role in digital technology in the world.";

            $("#partners-title").html("TUSHENG");
            $("#partner-image").attr("src", "https://obs.ap-southeast-3.myhuaweicloud.com/hiverlabtest/huawei-virtualtour/ui/logos/tusheng_logo.png");
            $("#partner-description").html(description);

            $("#partner-link").attr("value", "www.tushengcn.com");
            $(".clipboard-btn").attr("data-clipboard-text", "www.tushengcn.com");
            break;
        case "ASIALINK":
            var description = "▪ Supported by the Atlas artificial intelligence platform, jointly launched the substation intelligent operation and inspection solution.<br>▪ Based on the image recognition algorithm model, realize unmanned patrol, unmanned operation and intelligent security of substation.";

            $("#partners-title").html("ASIA LINK TECHNOLOGY");
            $("#partner-image").attr("src", "https://obs.ap-southeast-3.myhuaweicloud.com/hiverlabtest/huawei-virtualtour/ui/logos/asialink_logo.png");
            $("#partner-description").html(description);

            $("#partner-link").attr("value", "www.asialink.com");
            $(".clipboard-btn").attr("data-clipboard-text", "www.asialink.com");
            break;
        case "NCS":
            var description = "▪ Jointly develop cutting-edge solutions that combine NCS’ in-house capabilities, our global Information and communications technology (ICT) service expertise with Huawei's technologies.<br>▪ Areas of collaboration includes Video Platform on Cloud and Edge-Intelligent Cameras.";

            $("#partners-title").html("NCS");
            $("#partner-image").attr("src", "https://obs.ap-southeast-3.myhuaweicloud.com/hiverlabtest/huawei-virtualtour/ui/logos/ncs_logo.png");
            $("#partner-description").html(description);

            $("#partner-link").attr("value", "www.otsaw.com");
            $(".clipboard-btn").attr("data-clipboard-text", "www.otsaw.com");
            break;
        case "MTS":
            var description = "▪ 24/7 Huawei V3 Server Support<br>▪ Distribution of Atlas 200 Developer Kit across Singapore<br>▪ Huawei Certified Service Partner";

            $("#partners-title").html("MTS");
            $("#partner-image").attr("src", "https://obs.ap-southeast-3.myhuaweicloud.com/hiverlabtest/huawei-virtualtour/ui/logos/mts_logo.png");
            $("#partner-description").html(description);

            $("#partner-link").attr("value", "www.mts.sg");
            $(".clipboard-btn").attr("data-clipboard-text", "www.mts.sg");
            break;
        case "AXXONSOFT":
            var description = "Jointly developed a light intelligence video surveillance solution by fully exploiting Huawei's full stack of smart cameras, network and servers such as Huawei Taisan server together with Huawei Openlab. This avoided single product competition and gain overall competitive advantage.";

            $("#partners-title").html("AXXONSOFT");
            $("#partner-image").attr("src", "https://obs.ap-southeast-3.myhuaweicloud.com/hiverlabtest/huawei-virtualtour/ui/logos/axxonsoft_logo.png");
            $("#partner-description").html(description);

            $("#partner-link").attr("value", "www.axxonsoft.com");
            $(".clipboard-btn").attr("data-clipboard-text", "www.axxonsoft.com");
            break;
        case "INTERCORP":
            var description = "Jointly developed a FR Access Control Solution by leveraging Huawei industry leading Smart Cameras and ICT technologies.";

            $("#partners-title").html("INTERCORP");
            $("#partner-image").attr("src", "https://obs.ap-southeast-3.myhuaweicloud.com/hiverlabtest/huawei-virtualtour/ui/logos/otsaw_logo.png");
            $("#partner-description").html(description);

            $("#partner-link").attr("value", "www.intercorpsolutions.com");
            $(".clipboard-btn").attr("data-clipboard-text", "www.intercorpsolutions.com");
            break;
        case "AELF":
            var description = "What we are doing:<br>▪ Technical support on deploying blockchains<br>▪ Developing blockchain-based applications<br>▪ Business consultancy on blockchain adoption<br><br>What we have achieved with Huawei:<br>▪ Listed aelf Enterprise Blockchain on Huawei Cloud marketplace available to all clients<br>▪ Support Huawei as a blockchain provider within the Telecommunications industry<br>▪ Provided Blockchain educational and use-cases presentation in Huawei conferences";

            $("#partners-title").html("AELF");
            $("#partner-image").attr("src", "https://obs.ap-southeast-3.myhuaweicloud.com/hiverlabtest/huawei-virtualtour/ui/logos/aelf_logo.png");
            $("#partner-description").html(description);

            $("#partner-link").attr("value", "http://aelf.io");
            $(".clipboard-btn").attr("data-clipboard-text", "http://aelf.io");
            break;
        case "CLICK2CLOUD":
            var description = "Click2Cloud delivers a comprehensive multi-cloud management platform. Cloud Brain a unified interface platform through which administrators and users can easily view and control a multi-cloud environment from a single interface.<br>CloudBrain makes it easy with Huawei public cloud for organizations by enabling secure access to cloud resources, offers optimal toolset for cloud migration needs, accelerating resource provisioning, providing tools for tracking usage and costs, optimizing cloud usage, offering automation using custom-built templates, and comparing different services across leading cloud providers.";

            $("#partners-title").html("CLICK2CLOUD");
            $("#partner-image").attr("src", "https://obs.ap-southeast-3.myhuaweicloud.com/hiverlabtest/huawei-virtualtour/ui/logos/click2cloud_logo.png");
            $("#partner-description").html(description);

            $("#partner-link").attr("value", "www.click2cloud.com");
            $(".clipboard-btn").attr("data-clipboard-text", "www.click2cloud.com");
            break;
        case "DIGITWIN":
            var description = "▪ Promote and develop the integrated Digital Twin Platform & value-added applications for Smart City, Smart Ocean and Smart manufacturing, Jointly with Huawei and other partners in the Eco system.<br>▪ Make the cloud-based 3D-SaaS accessible & affordable for large corporates as well SME clients";

            $("#partners-title").html("DIGITAL TWIN");
            $("#partner-image").attr("src", "https://obs.ap-southeast-3.myhuaweicloud.com/hiverlabtest/huawei-virtualtour/ui/logos/digitwin_logo.png");
            $("#partner-description").html(description);

            $("#partner-link").attr("value", "www.digitwin.com.cn");
            $(".clipboard-btn").attr("data-clipboard-text", "www.digitwin.com.cn");
            break;
        case "HALTDOS":
            var description = "▪ HaltDos provides AI based Application Security Platform<br>▪ It is an Internationally Accredited Cyber Security Solution with CC EAL 2+ certification<br>▪ Secures a Crypto Exchange hosted on Huawei Cloud.";

            $("#partners-title").html("HALTDOS");
            $("#partner-image").attr("src", "https://obs.ap-southeast-3.myhuaweicloud.com/hiverlabtest/huawei-virtualtour/ui/logos/haltdos_logo.png");
            $("#partner-description").html(description);

            $("#partner-link").attr("value", "www.haltdos.com");
            $(".clipboard-btn").attr("data-clipboard-text", "www.haltdos.com");
            break;
        case "MINIVISION":
            var description = "▪ Huawei Cloud-based AI comprehensive face recognition solutions<br>▪ Jointly explore in Southeast Asian countries like Singapore and Philippines<br>▪ Smart retail and security";

            $("#partners-title").html("MINIVISION");
            $("#partner-image").attr("src", "https://obs.ap-southeast-3.myhuaweicloud.com/hiverlabtest/huawei-virtualtour/ui/logos/minivision_logo.png");
            $("#partner-description").html(description);

            $("#partner-link").attr("value", "http://ai.minivision.cn/");
            $(".clipboard-btn").attr("data-clipboard-text", "http://ai.minivision.cn/");
            break;
        case "MYDOC":
            var description = "▪ Jointly design, develop, verification of 5G enabled AR/VR healthcare rehab therapies<br>▪ Visual/Gesture AI technologies for remote monitoring of falls among elderly at nursinghomes<br>▪ IoT device management for remote monitoring of chronic diseases";

            $("#partners-title").html("MYDOC");
            $("#partner-image").attr("src", "https://obs.ap-southeast-3.myhuaweicloud.com/hiverlabtest/huawei-virtualtour/ui/logos/mydoc_logo.png");
            $("#partner-description").html(description);

            $("#partner-link").attr("value", "www.my-doc.com");
            $(".clipboard-btn").attr("data-clipboard-text", "www.my-doc.com");
            break;
        case "AISHU":
            var description = "AISHU has been cooperated with Huawei closely since 2017 in disaster recovery and document collaboration. Our solutions help customer ensure business continuity and develop office efficiency. With the joint innovation and the same cooperation idea which give top priority to quality and service, our solutions have served customers in more than 20 countries including government, corporation, finance, education, healthcare, etc.";

            $("#partners-title").html("AISHU");
            $("#partner-image").attr("src", "https://obs.ap-southeast-3.myhuaweicloud.com/hiverlabtest/huawei-virtualtour/ui/logos/aishu_logo.png");
            $("#partner-description").html(description);

            $("#partner-link").attr("value", "www.aishu.cn");
            $(".clipboard-btn").attr("data-clipboard-text", "www.aishu.cn");
            break;
        case "STENGINEERING":
            var description = "Collaboration to productise ST Engineering’s AI-Driven Video Analytics on the Huawei Atlas AI Edge hardware platform";

            $("#partners-title").html("ST ENGINEERING");
            $("#partner-image").attr("src", "https://obs.ap-southeast-3.myhuaweicloud.com/hiverlabtest/huawei-virtualtour/ui/logos/stengineering_logo.png");
            $("#partner-description").html(description);
            break;
        case "VIATICK":
            var description = "▪ OCR technology<br>▪ Docker container<br>▪ Bluetooth solutions roll out across globe;"

            $("#partners-title").html("VIATICK");
            $("#partner-image").attr("src", "https://obs.ap-southeast-3.myhuaweicloud.com/hiverlabtest/huawei-virtualtour/ui/logos/viatick_logo.png");
            $("#partner-description").html(description);
            break;
        case "NYP":
            var description = "The first local institution to join the Huawei ICT Academy programme";

            $("#partners-title").html("NANYANG POLYTECHNIC");
            $("#partner-image").attr("src", "https://obs.ap-southeast-3.myhuaweicloud.com/hiverlabtest/huawei-virtualtour/ui/logos/nyp_logo.png");
            $("#partner-description").html(description);
            break;
        case "TP":
            var description = "Have collaborations with Huawei in different project, including education and joint lab";

            $("#partners-title").html("TEMASEK POLYTECHNIC");
            $("#partner-image").attr("src", "https://obs.ap-southeast-3.myhuaweicloud.com/hiverlabtest/huawei-virtualtour/ui/logos/tp_logo.png");
            $("#partner-description").html(description);
            break;
        case "SP":
            var description = "New partner joint Huawei ICT Academy program in this year, working with Huawei in AI and IOT domain";

            $("#partners-title").html("SINGAPORE POLYTECHNIC");
            $("#partner-image").attr("src", "https://obs.ap-southeast-3.myhuaweicloud.com/hiverlabtest/huawei-virtualtour/ui/logos/sp_logo.png");
            $("#partner-description").html(description);
            break;
        case "SUSS":
            var description = "SUSS open Huawei ICT course to both PET and CET students, to support digital transformation in all industry";

            $("#partners-title").html("Singapore University of Social Sciences");
            $("#partner-image").attr("src", "https://obs.ap-southeast-3.myhuaweicloud.com/hiverlabtest/huawei-virtualtour/ui/logos/suss_logo.png");
            $("#partner-description").html(description);
            break;
        case "AITECH":
            var description = "▪ Shenzhen Artificial Intelligence Technology Co.Ltd is committed to providing business solutions to enterprises using cutting-edge artificial intelligence technology together with business consulting services. Has delivered projects in the e-government, logistics , new retail, securities and other industries.<br>▪ AiTech is jointly developing AI analytic models and algorithms in different industries with Huawei";

            $("#partners-title").html("AITECH");
            $("#partner-image").attr("src", "https://obs.ap-southeast-3.myhuaweicloud.com/hiverlabtest/huawei-virtualtour/ui/logos/aitech_logo.png");
            $("#partner-description").html(description);
            break;
        case "SCANMAX":
            var description = "▪ A leading worldwide IOT solution provider, specialized in 1D/2D barcode identification technology (Barcode Scanner, Android PDA, Mobile POS, etc.) , RFID (UHF) tech and face recognition technology almost 20 years<br>▪ Successful cases in Smart schools ,Smart hotels ,Intelligent New Retail at home and abroad<br>▪ Intelligent New Retail Solution provided together with Huawei Cloud";

            $("#partners-title").html("RAKINDA");
            $("#partner-image").attr("src", "https://obs.ap-southeast-3.myhuaweicloud.com/hiverlabtest/huawei-virtualtour/ui/logos/scanmax_logo.png");
            $("#partner-description").html(description);
            break;
        case "XINGHAI":
            var description = "▪ An Internet of Things company with a building networking operation platform, intelligent hardware, and artificial intelligence technology as the core, providing a total solution for smart buildings<br>▪ Setters and practitioners of China Overseas Smart Campus Standard<br>▪ The only building intelligent enterprise with independent artificial intelligence laboratory";

            $("#partners-title").html("XINGHAI");
            $("#partner-image").attr("src", "https://obs.ap-southeast-3.myhuaweicloud.com/hiverlabtest/huawei-virtualtour/ui/logos/xinghai_logo.png");
            $("#partner-description").html(description);
            break;
        case "GANWEISOFTWARE":
            var description = "▪ Ganwei software is a high-tech IoT company with the most connection capability, the most widely used and the best user experience, constructing completely closed loops in fields such as the Internet of everything, industry applications, large-screen visualization and natural interaction.<br>▪ Our IoT and IOC platform were both selected to the Huawei Cloud Marketplace.<br>▪ The project that we worked with Huawei cloud were focus on smart park and smart city.";

            $("#partners-title").html("GANWEI SOFTWARE");
            $("#partner-image").attr("src", "https://obs.ap-southeast-3.myhuaweicloud.com/hiverlabtest/huawei-virtualtour/ui/logos/ganwei_software_logo.png");
            $("#partner-description").html(description);
            break;
        case "WALLYT":
            var description = "▪ Empower Banks/Financial Institutions with acquiring, issuing, vertical solutions, integrated open banking solutions of mobile payments and host the service via Huawei Cloud<br>▪ Design one-stop integrated payment gateway to connect with multiple E-wallets, and payment channels, and host the service via Huawei Cloud<br>▪ Jointly provide all-in-one payment solutions for industries, corporations, and holding companies";

            $("#partners-title").html("WALLYT");
            $("#partner-image").attr("src", "https://obs.ap-southeast-3.myhuaweicloud.com/hiverlabtest/huawei-virtualtour/ui/logos/wallyt_logo.png");
            $("#partner-description").html(description);
            break;
        case "2DFIRE":
            var description = "Founded in 2005, 2Dfire dedicates in Cloud-based intelligent business solutions, by keeping abreast with the latest technology in the field and developing an innovative and interactive O2O platform for Restaurant and Retail business. <br> 2DFire has spread footprints over 7 countries/regions, reaching over 400 cities. 2DFire always keep in mind the core mission, which is enhancing business efficiency while cutting costs for our clients. From POS operations to Supply Chain management, from QR ordering to Targeted Marketing strategies, from enabling hassle-less payment to aiding financing plans - we are with our clients every little step along the way, daring to pioneer and dream beyond. On average, a single shop can save at least 30% of labor cost and generate 20% of new revenue with the help of 2Dfire applications. To this day, 2Dfire is corporation with over 450,000 merchants from restaurants, retails, shopping-malls to high-speed railway services.";

            $("#partners-title").html("2DFIRE");
            $("#partner-image").attr("src", "https://obs.ap-southeast-3.myhuaweicloud.com/hiverlabtest/huawei-virtualtour/ui/logos/2dfire_logo.png");
            $("#partner-description").html(description);
            break;
        case "ORANGE":
            var description = "We are very proud to be a Global Service Provider for Huawei Cloud who has enabled us to deliver solutions globally especially during this COVID-19 situation. Orange has chosen Huawei for their established, competitive info communication technology, a strong portfolio of end-to-end solutions in telecom and enterprise networks, devices and cloud computing. Digital has changed the world and Orange  together with Huawei build solid bridges from Cloud to Edge. We are always proud to offer the best solutions to our customers and our strong partnership with Huawei made it possible.";

            $("#partners-title").html("ORANGE BUSINESS SERVICES");
            $("#partner-image").attr("src", "https://obs.ap-southeast-3.myhuaweicloud.com/hiverlabtest/huawei-virtualtour/ui/logos/orange_logo.png");
            $("#partner-description").html(description);
            break;
        case "BCB":
            var description = "•Jointly develop digital transformation solutions for smart cities with blockchain technology using Huawei’s innovative Cloud Server Technology, empowering the delivery of data across ASEAN to enable BCB’s vast and rapid expansion in growing smart city solutions in the region<br>•Collaboration to provide comprehensive technology support to grow and develop smart city concepts with students, start ups and universities across Asia using blockchain technology";

            $("#partners-title").html("BCB");
            $("#partner-image").attr("src", "https://obs.ap-southeast-3.myhuaweicloud.com/hiverlabtest/huawei-virtualtour/ui/logos/bcb_logo.png");
            $("#partner-description").html(description);
            break;
    }

    //$("#partners-background").addClass("half-width");
    //$("#partners-background").removeClass("full-width");

    $("#partner-close-btn").show();
    $("#partner-close-bar").hide();
}

function ClosePartnerDescription() {
    console.log($("#partners-title").html);

    isShowingPartnersDescription = false;

    console.log("closing partners descriptions");
    $("#partner").collapse('hide');

    $("#partners-logos").collapse('show');

    $("#partners-title").html("OUR PARTNERS");


    //$("#partners-background").removeClass("half-width");
    //$("#partners-background").addClass("full-width");

    $("#partner-close-btn").hide();
    $("#partner-close-bar").show();
}

// Tooltip

$('clipboard-btn').tooltip({
    trigger: 'click'
});

function setTooltip(btn, message) {
    $(btn).tooltip('hide')
        .attr('data-original-title', message)
        .tooltip('show');
}

function hideTooltip(btn) {
    setTimeout(function () {
        $(btn).tooltip('hide');
    }, 1000);
}

// Clipboard

var btn = document.getElementsByClassName('clipboard-btn');
var clipboard = new ClipboardJS(btn);

clipboard.on('success', function (e) {
    setTooltip(e.trigger, 'Copied!');
    hideTooltip(e.trigger);
});

clipboard.on('error', function (e) {
    setTooltip(e.trigger, 'Failed!');
    hideTooltip(e.trigger);
});

AFRAME.registerComponent('log', {
    schema: {
        type: 'string'
    },

    init: function () {
        var stringToLog = this.data;
        console.log(stringToLog);

        console.log('Scene: ' + scene);

        // Read the project json file once the scene is loaded
        // Local file

        // URL
        // ReadTextFile('projects/project.json');

    }
});

var isMinimapLoaded = false;
var isLoggedIn = false;

function ShowLoadingPage() {
    // If minimap is loaded, then we don't need to show loading page
    if (isMinimapLoaded) {
        console.log("minimap loaded: " + isMinimapLoaded);

        $('#5g-button').click();

        //  Go to instructions directly
        goToInstructions();

        return;
    }

    $('#loading').addClass('box-visible');
    $('#loading').removeClass('box-hidden');
}

function HideLoadingPage() {
    console.log("minimap loaded: " + isMinimapLoaded);

    $('#loading').addClass('box-hidden');
    $('#loading').removeClass('box-visible');

    // If we are logged in, then go to instructions
    if (isLoggedIn) {
        goToInstructions();
    }
}

var selectedProject = 'none';

function LoadProject(project) {
    console.log("Loading project: " + project);

    if (selectedProject == project) {
        console.log('already selected');

        return;
    }

    selectedProject = project;

    $('#enter-tour-button').fadeIn();

    switch (project) {
        case "5G":
            ReadTextFile('projects/project-5g.json');

            $('#5g-button').removeClass('tech-btn-disabled');
            $('#ai-button').addClass('tech-btn-disabled');
            $('#cloud-button').addClass('tech-btn-disabled');

            $('#qr').fadeOut();

            break;
        case "AI":
            ReadTextFile('projects/project-ai.json');

            $('#5g-button').addClass('tech-btn-disabled');
            $('#ai-button').removeClass('tech-btn-disabled');
            $('#cloud-button').addClass('tech-btn-disabled');

            $('#qr').fadeIn();
            break;
        case "CLOUD":
            ReadTextFile('projects/project-cloud.json');

            $('#5g-button').addClass('tech-btn-disabled');
            $('#ai-button').addClass('tech-btn-disabled');
            $('#cloud-button').removeClass('tech-btn-disabled');

            $('#qr').fadeIn();

            break;
    }
    //ReadTextFile('projects/project.json');




}


// Project Building
// Read file function
function ReadTextFile(file) {
    var rawFile = new XMLHttpRequest();
    rawFile.open('GET', file, false);
    rawFile.onreadystatechange = function () {
        if (rawFile.readyState === 4) {
            if (rawFile.status === 200 || rawFile.status == 0) {
                var response = rawFile.responseText;
                console.log(response);

                BuildProject(response);
            }
        }
    }
    rawFile.send(null);
}

// Builds and populates project
function BuildProject(response) {
    console.log('Building project');

    // Create assets element
    assets = document.createElement('a-assets');

    // Parse text as json 
    projectObj = JSON.parse(response);

    DestroyInteractives();

    // Initialize project variables
    InitializeProject(projectObj);

    // Load the first scene
    LoadScene(scenes[startingScene]);

    // Append loaded assets to scene
    scene.append(assets);
}

function PreloadAllScenes() {
    for (let i = 0; i < scenes.length; i++) {
        // Retrieve background
        var sceneId = scenes[i]['id'];

        console.log('Preloading: ' + sceneId);

        var backgroundUrl = scenes[i]['background-url'];

        var imageAsset = document.createElement('img');

        imageAsset.setAttribute('id', 'preload');
        imageAsset.setAttribute('crossorigin', 'anonymous');
        imageAsset.setAttribute('src', backgroundUrl);

        var img = new Image();
        img.src = backgroundUrl;


        // Add background as an image asset
        AddImageAsset(sceneId, backgroundUrl);

        var interactives = scenes[i]['interactives'];

        // Load interactives after timeout
        for (let interactiveIndex = 0; interactiveIndex < interactives.length; interactiveIndex++) {
            PreloadInteractive(interactives[interactiveIndex]);
        }
    }

    /*
    var imageAsset = document.createElement('img');
    imageAsset.setAttribute('id', 'preload');
    imageAsset.setAttribute('crossorigin', 'anonymous');
    
    imageAsset.setAttribute('src', 'https://obs.ap-southeast-3.myhuaweicloud.com/hiverlabtest/huawei-virtualtour/ui/welcome%20screens/Welcome-5G.PNG');

    var img = new Image();
    img.src = backgroundUrl;
    
    imageAsset.setAttribute('src', 'https://obs.ap-southeast-3.myhuaweicloud.com/hiverlabtest/huawei-virtualtour/ui/welcome%20screens/Welcome-AI.png');

    img = new Image();
    img.src = backgroundUrl;
    
    imageAsset.setAttribute('src', 'https://obs.ap-southeast-3.myhuaweicloud.com/hiverlabtest/huawei-virtualtour/ui/welcome%20screens/Welcome-Cloud.jpg');

    img = new Image();
    img.src = backgroundUrl;
*/
}


// Preload interactive object given the interactiveObj json object
function PreloadInteractive(interactiveObj) {
    var interactiveId = interactiveObj['id'];
    console.log('Interactive id: ' + interactiveId);


    var imageAsset = document.createElement('img');

    imageAsset.setAttribute('id', 'preload');
    imageAsset.setAttribute('crossorigin', 'anonymous');


    // Check type and populate accordingly
    var id = interactiveObj['id'];
    var contentUrl = interactiveObj['content-url'];
    var type = interactiveObj['type'];

    console.log('Content url:  ' + contentUrl);
    console.log('Type: ' + type);

    // Type handling
    switch (type) {
        case 'Navigation':
            break;
        case 'Video':
            var thumbnailUrl = interactiveObj['thumbnail-url'];
            imageAsset.setAttribute('src', thumbnailUrl);
            var img = new Image();
            img.src = thumbnailUrl;
            break;
        case 'Image':
            imageAsset.setAttribute('src', contentUrl);

            var img = new Image();
            img.src = contentUrl;
            break;
        case 'Pdf':
            var thumbnailUrl = interactiveObj['thumbnail-url'];
            imageAsset.setAttribute('src', thumbnailUrl);
            var img = new Image();
            img.src = thumbnailUrl;

            img.src = contentUrl;
            break;
        case 'Link':
            imageAsset.setAttribute('src', './images/ui/logowall.png');

            var img = new Image();
            img.src = contentUrl;

            imageAsset.setAttribute('src', './images/ui/logowall_hover.png');

            var img = new Image();
            img.src = contentUrl;
            break;
        case 'Model':
            break;

        default:
            console.log('Undefined Interactive type: ' + type);
            break;
    }
}

// Initialize Project
function InitializeProject(projectObj) {
    projectId = projectObj['id'];

    console.log('Project id: ' + projectId);

    scenes = projectObj['scenes'];

    console.log('Scenes: ' + scenes.length);

    PreloadAllScenes();
}


// Create empty array of content
var contentObj = [];

var currentScene;
var currentSceneName;

// Loads a scene given the sceneObj json object
function LoadScene(sceneObj) {
    var sceneId = sceneObj['id'];
    var backgroundUrl = sceneObj['background-url'];
    var rotation = sceneObj['rotation'];
    console.log('Scene id: ' + sceneId);
    console.log('Background url: ' + backgroundUrl);
    console.log('Rotation: ' + rotation);

    currentSceneName = sceneObj['display-name']
    $("#area-name").html(currentSceneName);

    currentScene = sceneId;

    // Clear content array
    contentObj = [];

    /*
    // Set rotation
    console.log('Rotation: ' + sceneObj['rotation']);
    
    sceneRotationVector3 = ParseVector3(sceneObj['rotation']);
    
    var el = document.querySelector("a-camera");
    console.log(el.object3D.rotation);
    el.removeAttribute('look-controls');
    
    //el.object3D.rotation.set(THREE.Math.degToRad(sceneRotationVector3.x), THREE.Math.degToRad(sceneRotationVector3.y), THREE.Math.degToRad(sceneRotationVector3.z));
    el.object3D.rotation.set(THREE.Math.degToRad(40), THREE.Math.degToRad(40), THREE.Math.degToRad(40));
    console.log(el.object3D.rotation);
    el.setAttribute('look-controls', '');
    //el.object3D.rotation.set(THREE.Math.degToRad(sceneRotationVector3.x), THREE.Math.degToRad(sceneRotationVector3.y), THREE.Math.degToRad(sceneRotationVector3.z));
    
    //console.log('camera: ' + el.components['look-controls']);
    
    //el.components["look-controls"].pitchObject.rotation.x = 0.7;
    //el.components["look-controls"].yawObject.rotation.y = 0.8;
    
    //cameraRig.components['look-controls'].yawObject.rotation.y = 90;
    */

    var interactives = sceneObj['interactives'];
    console.log('Interactives: ' + interactives.length);

    // Load media in scene
    var media = sceneObj['media'];


    // Clear media gallery first
    $('.nav-sidebar').html('');

    // Load interactives after timeout
    setTimeout(function () {
        for (let interactiveIndex = 0; interactiveIndex < interactives.length; interactiveIndex++) {
            LoadInteractive(interactives[interactiveIndex]);
        }

        for (let mediaIndex = 0; mediaIndex < media.length; mediaIndex++) {
            LoadSceneMedia(media[mediaIndex]);
        }
        console.log(contentObj);


        var el = document.querySelector("a-camera");
        //console.log(el.object3D.rotation);

        el.removeAttribute('look-controls');

        el.object3D.rotation.x = 0;
        el.object3D.rotation.y = 0;

        el.setAttribute('look-controls', '');

        //console.log(el.object3D.rotation);

        //$('.nav-sidebar').html(contentObj.map(Item).join(''));
    }, fadeDuration * 1.5);

    // Start fade animation on background
    background.emit('fade');
    console.log('fade background');


    var targetFov = 90;
    var myObject = {
        fov: targetFov
    };

    $(myObject).animate({
        fov: 50
    }, {
        duration: 450,
        progress: function () {
            $("#camera").attr('fov', myObject.fov);
        },
        complete: function () {
            $("#camera").attr('fov', 90);
            LoadBackground(sceneId, rotation);
        }
    });

    console.log(contentObj);
}

// Loads media in the given scene
function LoadSceneMedia(mediaObj) {
    var mediaId = mediaObj['id'];
    console.log('Media id: ' + mediaId);

    // Check type and populate accordingly
    var contentUrl = mediaObj['content-url'];
    var type = mediaObj['type'];

    var currentContentObj;

    var folderName = mediaObj['folder'];
    var formattedFolderName;
    var folderContainerId;
    var category;

    if (mediaObj['category'] != null) {

        category = mediaObj['category'];
    }

    var thumbnailUrl;

    if (mediaObj['thumbnail-url'] != null) {

        thumbnailUrl = mediaObj['thumbnail-url'];
    }


    // Type handling
    switch (type) {
        case 'Video':
            currentContentObj = {
                type: 'VIDEO',
                title: mediaId,
                url: contentUrl,
                category: category,
                thumbnailUrl: thumbnailUrl
            };

            contentObj.push(currentContentObj);

            break;
        case 'Image':

            currentContentObj = {
                type: 'IMAGE',
                title: mediaId,
                url: contentUrl,
                category: category,
                thumbnailUrl: thumbnailUrl
            };


            contentObj.push(currentContentObj);

            break;
        case 'Pdf':

            currentContentObj = {
                type: 'PDF',
                title: mediaId,
                url: contentUrl,
                category: category,
                thumbnailUrl: thumbnailUrl
            };

            contentObj.push(currentContentObj);
            break;
        case 'Model':
            console.log('Adding model');
            break;
        case 'Embedded':
            console.log('Adding embedded');

            currentContentObj = {
                type: 'INTERACTIVE',
                title: mediaId,
                url: contentUrl,
                category: category,
                thumbnailUrl: thumbnailUrl
            };


            contentObj.push(currentContentObj);
            break;

        default:
            console.log('Undefined media type: ' + type);
            break;
    }

    // If this content belongs in a folder
    if (folderName != null) {
        formattedFolderName = 'folder-' + folderName.replace(/\s+/g, '-');
        folderContainerId = formattedFolderName + '-container';

        // If folder doesn't exist
        if (!$('#' + folderContainerId).length) {
            CreateFolder(folderName, formattedFolderName, category);
        }

        var folderId = '#' + formattedFolderName + '-collapse';

        console.log('folder id:' + folderId);

        $(folderId).on('show.bs.collapse', function () {
            console.log("collapse shown " + formattedFolderName + '-dropdown');
            $('#' + formattedFolderName + '-dropdown').addClass("rotate-180");
            $('#' + formattedFolderName + '-dropdown').removeClass("rotate-0");
        });

        $(folderId).on('hide.bs.collapse', function () {
            // do something…
            console.log('collapse hide');
            $('#' + formattedFolderName + '-dropdown').addClass("rotate-0");
            $('#' + formattedFolderName + '-dropdown').removeClass("rotate-180");
        });

        // Folder should exist by now, so we just append it
        $('#' + folderContainerId).append(contentObj.map(Item).join(''));
    } else {
        $('.nav-sidebar').append(contentObj.map(Item).join(''));
    }

    contentObj = [];
}

function CreateFolder(folderName, formattedFolderName, category) {
    console.log("Creating folder: " + folderName);

    var folderObj = [];

    var currentFolderObj = {
        folderId: formattedFolderName,
        folderName: folderName,
        folderCollapse: formattedFolderName + '-collapse',
        folderContainerId: formattedFolderName + '-container',
        category: category
    }

    folderObj.push(currentFolderObj);

    // Append the created folder to the nav sidebar
    $('.nav-sidebar').append(folderObj.map(Folder).join(''));
}


// Loads interactive object given the interactiveObj json object
function LoadInteractive(interactiveObj) {
    var interactiveId = interactiveObj['id'];
    console.log('Interactive id: ' + interactiveId);

    // Load transforms
    var position = interactiveObj['position'];
    var rotation = interactiveObj['rotation'];
    var scale = interactiveObj['scale'];

    console.log('Position: ' + position + ' Rotation: ' + rotation + ' Scale: ' + scale);

    // Check type and populate accordingly
    var contentUrl = interactiveObj['content-url'];
    var type = interactiveObj['type'];
    var thumbnailUrl = interactiveObj['thumbnail-url'];

    // Check if inactive
    var isInactive = interactiveObj['active'] == false;

    console.log('isInactive: ' + isInactive);

    console.log('Content url:  ' + contentUrl);
    console.log('Type: ' + type);

    var currentContentObj;

    var category;
    if (interactiveObj['category'] != null) {
        category = interactiveObj['category'];
    }

    console.log('id: ' + interactiveId + ' category: ' + category)

    // Type handling
    switch (type) {
        case 'Navigation':
            AddInteractiveNavigationEntity(interactiveId, position, rotation, scale, contentUrl);
            break;
        case 'Video':
            AddInteractiveVideoEntity(interactiveId, position, rotation, scale, contentUrl, thumbnailUrl, isInactive, category);

            //HideVideoContainer();

            break;
        case 'Image':
            AddInteractiveImageEntity(interactiveId, position, rotation, scale, contentUrl, isInactive);

            //HideImageContainer();

            break;
        case 'Model':
            console.log('Adding model');

            //AddInteractiveModelEntity(interactiveId, position, rotation, scale, contentUrl)

            //HideModelContainer();
            break;
        case 'Link':
            AddInteractiveLinkEntity(interactiveId, position, rotation, scale, contentUrl, thumbnailUrl);
            break;

        case 'Embedded':
            var displayName = interactiveObj['display-name'];
            console.log('embedded display name: ' + displayName);

            AddInteractiveEmbeddedEntity(interactiveId, position, rotation, scale, contentUrl, category);
            break;
        case 'Welcome':
            AddInteractiveWelcomeScreen(interactiveId, position, rotation, scale, contentUrl);
            break;

        default:
            console.log('Undefined Interactive type: ' + type);
            break;
    }
}

// Sets background given the sceneId
function LoadBackground(sceneId, rotation) {
    console.log("Loading background: " + sceneId);

    // Set background
    background.setAttribute('src', '#' + sceneId);
    background.setAttribute('rotation', rotation);
    background.setAttribute('color', '#000000');

    if (isTesting) {
        background.setAttribute('color', '#ffffff');
    }
}

// Getters
function GetSceneId(index) {
    return scenes[index]['id'];
}

// Return scene index given id
function GetSceneIndex(id) {
    for (let i = 0; i < scenes.length; i++) {
        console.log(scenes[i]['id']);
        if (scenes[i]['id'] === id) {
            return i;
        }
    }

    return -1;
}

// Populating image assets
//  - id is used by other elements to refer to it
//  - url is source of asset
function AddImageAsset(id, url) {
    var imageAsset = document.createElement('img');

    imageAsset.setAttribute('id', id);
    imageAsset.setAttribute('crossorigin', 'anonymous');
    imageAsset.setAttribute('src', url);

    assets.append(imageAsset);
}

// Destroy all interactives in scene
function DestroyInteractives() {
    console.log('Destroy interactives');

    // Should use id next time as they may be other elements using link class
    var interactives = scene.querySelectorAll('.link');

    console.log(interactives);

    for (let i = 0; i < interactives.length; i++) {
        scene.removeChild(interactives[i]);
    }
}






// Interactive Navigation Entity
// contentUrl is used to specify which scene id to jump to
function AddInteractiveNavigationEntity(id, position, rotation, scale, contentUrl) {
    console.log('Adding interactive navigation entity: ' + id);

    // Create a clickable image 
    var entity = document.createElement('a-image');

    // Set basic attributes
    entity.setAttribute('id', 'interactive-navigation');
    entity.setAttribute('class', 'link');
    entity.setAttribute('src', '#arrow-0');
    entity.setAttribute('height', 1);
    entity.setAttribute('width', 1);
    entity.setAttribute('material', 'npot: true;');


    if (id == "To Developer Zone") {
        entity.setAttribute('src', 'https://obs.ap-southeast-3.myhuaweicloud.com/hiverlabtest/huawei-virtualtour/ui/dev_zone.png');
        entity.setAttribute('height', 0.4);
        entity.setAttribute('width', 1.75);
        entity.setAttribute('material', 'npot: false;');
    }

    if (id == "Exit") {
        entity.setAttribute('src', '#exit-0');
    }

    // Set transforms
    var positionVector = ParseVector3(position);
    var rotationVector = ParseVector3(rotation);
    var scaleVector = ParseVector3(scale);

    entity.object3D.position.set(positionVector.x, positionVector.y, positionVector.z);
    entity.object3D.rotation.set(THREE.Math.degToRad(rotationVector.x), THREE.Math.degToRad(rotationVector.y), THREE.Math.degToRad(rotationVector.z));
    entity.object3D.scale.set(scaleVector.x, scaleVector.y, scaleVector.z);

    var hoverScale = scaleVector.multiplyScalar(1.1);

    // Mouse events
    // Add hover listener
    entity.addEventListener('mouseenter', function () {
        //descriptionBox.style.display = 'block';
        $("#movingbox").addClass('box-visible');
        $("#movingbox").removeClass('box-hidden');


        textDescription.innerHTML = id;
        if (id == "To Developer Zone") {
            entity.setAttribute('src', 'https://obs.ap-southeast-3.myhuaweicloud.com/hiverlabtest/huawei-virtualtour/ui/dev_zone.png');
        } else if (id == "Exit") {
            entity.setAttribute('src', '#exit-0');
            var duration = 50;

            setTimeout(function () {
                entity.setAttribute('src', '#exit-1');

                setTimeout(function () {
                    entity.setAttribute('src', '#exit-2');

                    setTimeout(function () {
                        entity.setAttribute('src', '#exit-3');
                        setTimeout(function () {
                            entity.setAttribute('src', '#exit-0');

                        }, duration);
                    }, duration);
                }, duration);
            }, duration);

        } else {
            LoopFrames(entity);
        }
    });

    // Add out listener
    entity.addEventListener('mouseleave', function () {
        //descriptionBox.style.display = 'none';
        $("#movingbox").addClass('box-hidden');
        $("#movingbox").removeClass('box-visible');

        if (id == "To Developer Zone") {
            entity.setAttribute('src', 'https://obs.ap-southeast-3.myhuaweicloud.com/hiverlabtest/huawei-virtualtour/ui/dev_zone_hover.png');
        } else if (id == "Exit") {
            entity.setAttribute('src', '#exit-0');
        } else {
            entity.setAttribute('src', '#arrow');
        }
    });

    // Add click listener
    entity.addEventListener('click', function () {
        console.log('Interactive navigation entity: ' + contentUrl);

        console.log('Scene index: ' + GetSceneIndex(contentUrl));

        if (id == "Exit") {
            goToInstructions();
        } else {
            // Destroy interactives after timeout
            DestroyInteractivesAfterTime();

            // Load scene
            LoadScene(scenes[GetSceneIndex(contentUrl)]);
        }


    });

    // Append entity to scene
    scene.appendChild(entity);
}

function LoopFrames(entity) {
    var duration = 50;

    setTimeout(function () {
        entity.setAttribute('src', '#arrow-1');

        setTimeout(function () {
            entity.setAttribute('src', '#arrow-2');

            setTimeout(function () {
                entity.setAttribute('src', '#arrow-3');

                setTimeout(function () {
                    entity.setAttribute('src', '#arrow-0');


                    setTimeout(function () {
                        entity.setAttribute('src', '#arrow-1');


                        setTimeout(function () {
                            entity.setAttribute('src', '#arrow-2');


                            setTimeout(function () {
                                entity.setAttribute('src', '#arrow-3');

                                setTimeout(function () {
                                    entity.setAttribute('src', '#arrow-0');

                                }, duration);

                            }, duration);

                        }, duration);

                    }, duration);

                }, duration);

            }, duration);
        }, duration);
    }, duration);
}


function DestroyInteractivesAfterTime() {
    setTimeout(function () {
        DestroyInteractives();
    }, fadeDuration / 2);
}



// Interactive Embedded Entity
// contentUrl is used to specify which embedded page
function AddInteractiveEmbeddedEntity(id, position, rotation, scale, contentUrl, category) {
    console.log('Adding interactive embedded entity: ' + id + ' category: ' + category);

    // Create a clickable image 
    var entity = document.createElement('a-image');

    // Set basic attributes
    entity.setAttribute('id', 'interactive-link');
    entity.setAttribute('class', 'link');
    entity.setAttribute('src', '#3d');
    entity.setAttribute('height', 1);
    entity.setAttribute('width', 1);

    if (id == "Huawei Talent Online") {
        entity.setAttribute('src', 'https://obs.ap-southeast-3.myhuaweicloud.com/hiverlabtest/huawei-virtualtour/ui/media_lib.png');
        entity.setAttribute('height', 0.5);
        entity.setAttribute('width', 1.35);
    }

    // Set transforms
    var positionVector = ParseVector3(position);
    var rotationVector = ParseVector3(rotation);
    var scaleVector = ParseVector3(scale);

    entity.object3D.position.set(positionVector.x, positionVector.y, positionVector.z);
    entity.object3D.rotation.set(THREE.Math.degToRad(rotationVector.x), THREE.Math.degToRad(rotationVector.y), THREE.Math.degToRad(rotationVector.z));
    entity.object3D.scale.set(scaleVector.x, scaleVector.y, scaleVector.z);

    var hoverScale = scaleVector.multiplyScalar(1.1);

    // Mouse events
    // Add hover listener
    entity.addEventListener('mouseenter', function () {
        //descriptionBox.style.display = 'block';         
        $("#movingbox").addClass('box-visible');
        $("#movingbox").removeClass('box-hidden');


        textDescription.innerHTML = id;

        if (id == "Huawei Talent Online") {
            entity.setAttribute('src', 'https://obs.ap-southeast-3.myhuaweicloud.com/hiverlabtest/huawei-virtualtour/ui/media_lib_hover.png');
            textDescription.innerHTML = "Virtual Academy";
        } else if (id == "Atlas 200") {
            textDescription.innerHTML = "Ascend + Kunpeng";
        } else {
            entity.setAttribute('src', '#3d-hover');
        }
    });

    // Add out listener
    entity.addEventListener('mouseleave', function () {
        //descriptionBox.style.display = 'none';         
        $("#movingbox").addClass('box-hidden');
        $("#movingbox").removeClass('box-visible');


        if (id == "Huawei Talent Online") {
            entity.setAttribute('src', 'https://obs.ap-southeast-3.myhuaweicloud.com/hiverlabtest/huawei-virtualtour/ui/media_lib.png');
        } else {

            entity.setAttribute('src', '#3d');
        }
    });

    // Add click listener
    entity.addEventListener('click', function () {
        console.log('Interactive link entity: ' + contentUrl);

        //descriptionBox.style.display = 'none';         
        $("#movingbox").addClass('box-hidden');
        $("#movingbox").removeClass('box-visible');

        if (id == "Partner DIGI: AI Scale Device") {
            ShowScannerContainer();
        } else {
            console.log('id:' + id + ' category: ' + category);


            // Show container
            ShowMediaGallery(id, category);
        }

    });

    // Append entity to scene
    scene.appendChild(entity);
}




// Interactive Welcome Entity
// contentUrl is the image used
function AddInteractiveWelcomeScreen(id, position, rotation, scale, contentUrl) {
    console.log('Adding interactive welcome screen: ' + id);

    // Create a clickable image 
    var entity = document.createElement('a-image');
    // Set basic attributes
    entity.setAttribute('id', 'interactive-link');
    entity.setAttribute('class', 'link');
    entity.setAttribute('height', 1.9);
    entity.setAttribute('width', 3.25);
    //entity.setAttribute('text', 'value: Welcome');
    entity.setAttribute('text', 'height: 2');

    if (id == "Welcome Screen 5G") {
        entity.setAttribute('src', './images/ui/Welcome-5G.PNG');
    }
    if (id == "Welcome Screen AI") {
        entity.setAttribute('src', './images/ui/Welcome-AI.png');
    }
    if (id == "Welcome Screen Cloud") {
        entity.setAttribute('src', './images/ui/Welcome-Cloud.jpg');
    }

    // Set transforms
    var positionVector = ParseVector3(position);
    var rotationVector = ParseVector3(rotation);
    var scaleVector = ParseVector3(scale);

    entity.object3D.position.set(positionVector.x, positionVector.y, positionVector.z);
    entity.object3D.rotation.set(THREE.Math.degToRad(rotationVector.x), THREE.Math.degToRad(rotationVector.y), THREE.Math.degToRad(rotationVector.z));
    entity.object3D.scale.set(scaleVector.x, scaleVector.y, scaleVector.z);

    // Append entity to scene
    scene.appendChild(entity);

    /*
    var contentString = "Welcome to 5G" + "\nName";
    
    // Create a text
    var textEntity = document.createElement('a-text');
    // Set basic attributes
    textEntity.setAttribute('id', 'interactive-link');
    textEntity.setAttribute('class', 'link');
    textEntity.setAttribute('value', contentString);
    textEntity.setAttribute('height', 1.9);
    textEntity.setAttribute('width', 3);
    textEntity.setAttribute('align', 'center');
    textEntity.setAttribute('anchor', 'center');
    textEntity.setAttribute('baseline', 'top');
    textEntity.setAttribute('font', 'exo2semibold');

    // Set transforms
    var positionVector = ParseVector3(position);
    var rotationVector = ParseVector3(rotation);
    var scaleVector = ParseVector3(scale);

    textEntity.object3D.position.set(positionVector.x, positionVector.y, positionVector.z);
    textEntity.object3D.rotation.set(THREE.Math.degToRad(rotationVector.x), THREE.Math.degToRad(rotationVector.y), THREE.Math.degToRad(rotationVector.z));
    textEntity.object3D.scale.set(scaleVector.x, scaleVector.y, scaleVector.z);

    // Append entity to scene
    scene.appendChild(textEntity);
    */
}




// Interactive Link Entity
// contentUrl is used to specify which webpage to jump to
function AddInteractiveLinkEntity(id, position, rotation, scale, contentUrl, thumbnailUrl) {
    console.log('Adding interactive navigation entity: ' + id);

    // Create a clickable image 
    var entity = document.createElement('a-image');

    // Set basic attributes
    entity.setAttribute('id', 'interactive-link');
    entity.setAttribute('class', 'link');
    entity.setAttribute('src', './images/ui/logowall.png');
    entity.setAttribute('height', 0.2);
    entity.setAttribute('width', 1);


    // Set transforms
    var positionVector = ParseVector3(position);
    var rotationVector = ParseVector3(rotation);
    var scaleVector = ParseVector3(scale);

    entity.object3D.position.set(positionVector.x, positionVector.y, positionVector.z);
    entity.object3D.rotation.set(THREE.Math.degToRad(rotationVector.x), THREE.Math.degToRad(rotationVector.y), THREE.Math.degToRad(rotationVector.z));
    entity.object3D.scale.set(scaleVector.x, scaleVector.y, scaleVector.z);

    var hoverScale = scaleVector.multiplyScalar(1.1);

    // Mouse events
    // Add hover listener
    entity.addEventListener('mouseenter', function () {
        //descriptionBox.style.display = 'block';         
        $("#movingbox").addClass('box-visible');
        $("#movingbox").removeClass('box-hidden');
        textDescription.innerHTML = id;

        entity.setAttribute('src', './images/ui/logowall_hover.png');
    });

    // Add out listener
    entity.addEventListener('mouseleave', function () {
        //descriptionBox.style.display = 'none';         
        $("#movingbox").addClass('box-hidden');
        $("#movingbox").removeClass('box-visible');

        entity.setAttribute('src', './images/ui/logowall.png');
    });

    // Add click listener
    entity.addEventListener('click', function () {
        console.log('Interactive link entity: ' + contentUrl);
        //descriptionBox.style.display = 'none';         
        $("#movingbox").addClass('box-hidden');
        $("#movingbox").removeClass('box-visible');

        //OpenInNewTab(contentUrl);
        ShowPartnersContainer();
    });

    // Append entity to scene
    scene.appendChild(entity);
}


function OpenInNewTab(url) {
    var win = window.open(url, '_blank');
    win.focus();
}


// Interactive Video Entity
// contentUrl is used to specify which video to load
function AddInteractiveVideoEntity(id, position, rotation, scale, contentUrl, thumbnailUrl, isInactive, category) {
    console.log('Adding interactive video entity: ' + id);

    var parentEntity = document.createElement('a-entity');
    parentEntity.setAttribute('class', 'link');
    parentEntity.setAttribute('click-drag');

    // Create a clickable image 
    var entity = document.createElement('a-image');

    // Set basic attributes
    entity.setAttribute('id', 'interactive-video-' + id);
    entity.setAttribute('height', 2);
    entity.setAttribute('width', 3);
    entity.setAttribute('material', 'opacity', 1.0);

    // Create video thumbnail
    var thumbnailEntity = document.createElement('a-image');

    // Somehow this needs to be set or it won't show
    entity.setAttribute('src', thumbnailUrl);

    // Set basic attributes
    thumbnailEntity.setAttribute('src', thumbnailUrl);
    thumbnailEntity.setAttribute('height', 2);
    thumbnailEntity.setAttribute('width', 3);
    thumbnailEntity.setAttribute('material', 'opacity', 1.0);

    entity.appendChild(thumbnailEntity);

    // Set transforms
    var positionVector = ParseVector3(position);
    var rotationVector = ParseVector3(rotation);
    var scaleVector = ParseVector3(scale);

    parentEntity.object3D.position.set(positionVector.x, positionVector.y, positionVector.z);
    parentEntity.object3D.rotation.set(THREE.Math.degToRad(rotationVector.x), THREE.Math.degToRad(rotationVector.y), THREE.Math.degToRad(rotationVector.z));
    parentEntity.object3D.scale.set(scaleVector.x, scaleVector.y, scaleVector.z);

    // Add hover listener
    entity.addEventListener('mouseenter', function () {
        //descriptionBox.style.display = 'block';         
        $("#movingbox").addClass('box-visible');
        $("#movingbox").removeClass('box-hidden');
        textDescription.innerHTML = id;

        if (!isInactive) {
            entity.setAttribute('src', '#video-hover');
        }
    });

    // Add out listener
    entity.addEventListener('mouseleave', function () {
        //descriptionBox.style.display = 'none';         
        $("#movingbox").addClass('box-hidden');
        $("#movingbox").removeClass('box-visible');

        if (!isInactive) {
            entity.setAttribute('src', '#video');
        }
    });

    if (!isInactive) {
        // Only set src here
        entity.setAttribute('src', '#video');

        // Add click listener
        entity.addEventListener('click', function () {
            console.log('Interactive video entity: ' + contentUrl);

            //descriptionBox.style.display = 'none';         
            $("#movingbox").addClass('box-hidden');
            $("#movingbox").removeClass('box-visible');

            //videoDescription.innerHTML = id;

            // Show container
            ShowMediaGallery(id, category);
        });
    }

    parentEntity.appendChild(entity);

    // Append entity to scene
    scene.appendChild(parentEntity);
}



// Interactive Image Entity
// contentUrl is used to specify which image to load
function AddInteractiveImageEntity(id, position, rotation, scale, contentUrl, isInactive) {
    console.log('Adding interactive image entity: ' + id);

    var parentEntity = document.createElement('a-entity');
    parentEntity.setAttribute('class', 'link');

    // Create a clickable image 
    var entity = document.createElement('a-image');

    // Set basic attributes
    entity.setAttribute('id', 'interactive-image');
    entity.setAttribute('height', 1.35);
    entity.setAttribute('width', 2);
    entity.setAttribute('material', 'opacity', 1.0);

    var thumbnailEntity = document.createElement('a-image');

    // Somehow this needs to be set or it won't show
    entity.setAttribute('src', contentUrl);

    // Set basic attributes
    thumbnailEntity.setAttribute('src', contentUrl);
    thumbnailEntity.setAttribute('height', 1.35);
    thumbnailEntity.setAttribute('width', 2);
    thumbnailEntity.setAttribute('material', 'opacity', 1.0);

    entity.appendChild(thumbnailEntity);

    // Set transforms
    var positionVector = ParseVector3(position);
    var rotationVector = ParseVector3(rotation);
    var scaleVector = ParseVector3(scale);

    parentEntity.object3D.position.set(positionVector.x, positionVector.y, positionVector.z);
    parentEntity.object3D.rotation.set(THREE.Math.degToRad(rotationVector.x), THREE.Math.degToRad(rotationVector.y), THREE.Math.degToRad(rotationVector.z));
    parentEntity.object3D.scale.set(scaleVector.x, scaleVector.y, scaleVector.z);


    // Mouse events
    // Add hover listener
    entity.addEventListener('mouseenter', function () {
        //descriptionBox.style.display = 'block';         
        $("#movingbox").addClass('box-visible');
        $("#movingbox").removeClass('box-hidden');
        textDescription.innerHTML = id;

        imageDescription.innerHTML = id;

        if (!isInactive) {
            entity.setAttribute('src', '#image-hover');
        }
    });

    // Add out listener
    entity.addEventListener('mouseleave', function () {
        //descriptionBox.style.display = 'none';         
        $("#movingbox").addClass('box-hidden');
        $("#movingbox").removeClass('box-visible');

        imageDescription.innerHTML = id;

        if (!isInactive) {
            entity.setAttribute('src', '#image');
        }
    });

    if (!isInactive) {
        entity.setAttribute('src', '#image'); // We are using same content as thumbnail here

        // Add click listener
        entity.addEventListener('click', function () {
            console.log('Interactive image entity: ' + contentUrl);

            // Hide description box
            //descriptionBox.style.display = 'none';         
            $("#movingbox").addClass('box-hidden');
            $("#movingbox").removeClass('box-visible');

            // Update player url
            document.getElementById('target-image').src = contentUrl;

            // Show container
            ShowMediaGallery(id);
        });
    }

    parentEntity.appendChild(entity);

    // Append entity to scene
    scene.appendChild(parentEntity);
}

// Show image container
function ShowImageContainer() {
    var imageContainer = document.getElementById('image-container');
    imageContainer.style.display = 'block';
}

// Hide image container
function HideImageContainer() {
    var imageContainer = document.getElementById('image-container');
    imageContainer.style.display = 'none';
}

// Show partners container
function ShowPartnersContainer() {
    $("#partners-container").removeClass("hidden");
    $("#partners-container").addClass("visible");

    $("#partners-logos-container").scrollTop(0);
}

// Hide partners container
function HidePartnersContainer() {
    $("#partners-container").removeClass("visible");
    $("#partners-container").addClass("hidden");
}

// Show feedback container
function ShowFeedbackContainer() {
    $('.feedback-btn').val("SEND FEEDBACK");

    $("#feedback-container").removeClass("hidden");
    $("#feedback-container").addClass("visible");
}

// Hide partners container
function HideFeedbackContainer() {
    $("#feedback-container").removeClass("visible");
    $("#feedback-container").addClass("hidden");
}

function SubmitFeedback() {
    console.log("Theme: " + selectedProject + " Zone: " + currentSceneName + " Feedback: " + $("#feedbackField").val());

    // Check session token
    if (sessionStorage.getItem('session_token') != null) {
        // Update session

        var email = sessionStorage.getItem('email');
        var sessionToken = sessionStorage.getItem('session_token');
        var message = $("#feedbackField").val();

        var url = "https://clients.storyhive.io/HuaWei_Virtual_Tour/app_api/v0.1/SubmitFeedback.php";

        var formData = {
            'email': email,
            'session_token': sessionToken,
            'message': message,
            'theme_selected': selectedProject,
            'zone': currentSceneName
        };

        $('.feedback-btn').val("SENDING FEEDBACK");

        $.ajax({
            type: 'POST',
            url: url,
            data: formData,
            encode: true,
            success: function (response, status, xhr) {
                console.log("Response: " + response);

                const responseObj = JSON.parse(response);

                if (responseObj['status'] == "200") {
                    $('.feedback-btn').val("FEEDBACK SUBMITTED");

                    $("#feedback-form").trigger("reset");
                } else {
                    $('.feedback-btn').val("SEND FEEDBACK");
                }

            },
            error: function (xhr, status, error) {
                console.log("Something went wrong: " + error);
            }
        });
    }
}

// Show feedback container
function ShowIFrameContainer() {
    if (isMobile) {
        $("#mobile-minimap-container").removeClass("hidden");
        $("#mobile-minimap-container").addClass("visible");
        ShowCurrentSceneColor();
    } else {
        $("#minimap-container").removeClass("hidden");
        $("#minimap-container").addClass("visible");
    }
}

// Hide partners container
function HideIFrameContainer() {
    if (isMobile) {
        $("#mobile-minimap-container").removeClass("visible");
        $("#mobile-minimap-container").addClass("hidden");
    } else {
        $("#minimap-container").removeClass("visible");
        $("#minimap-container").addClass("hidden");
    }
}

// Show Scanner container
function ShowScannerContainer() {
    $("#scanner-container").removeClass("hidden");
    $("#scanner-container").addClass("visible");

    //vid1

    console.log('window: ' + document.getElementById('embedded-iframe-scanner').contentWindow.document);

    document.getElementById('embedded-iframe-scanner').contentWindow.PlayVideo();
}

// Hide Scanner container
function HideScannerContainer() {
    $("#scanner-container").removeClass("visible");
    $("#scanner-container").addClass("hidden");

    if (document.getElementById('embedded-iframe-scanner').contentWindow.PauseVideo != null) {

        document.getElementById('embedded-iframe-scanner').contentWindow.PauseVideo();
    }
}



// Helper functions
function ParseVector3(vector3) {
    var values = vector3.split(' ');

    return new THREE.Vector3(values[0], values[1], values[2]);
}

function GetVector3String(vector3) {
    return vector3.x + ' ' + vector3.y + ' ' + vector3.z;
}

function getAlphanumericId(id) {
    return id.replace(/\s+/g, '-').toLowerCase();
}

var isTesting = false;
var startingScene = 5;

if (isTesting) {
    //ReadTextFile('projects/project-5g.json');
    //ReadTextFile('projects/project-ai.json');
    ReadTextFile('projects/project-cloud.json');
    HideLoadingPage();
    $('#introduction').css('display', 'none');
    $('#registration').css('display', 'none');
} else {
    startingScene = 0;
}

var listCount = 7;

function ShowCurrentSceneColor() {
    var selectedElement = -1;

    console.log("Minimap List: " + currentScene);

    if (currentScene == "Zone 1") {
        selectedElement = 5;
    }

    if (currentScene == "Zone 2") {
        selectedElement = 6;
    }

    if (currentScene == "Zone 3") {
        selectedElement = 4;
    }

    if (currentScene == "Zone 4") {
        selectedElement = 3;
    }

    if (currentScene == "Zone 5") {
        selectedElement = 1;
    }

    if (currentScene == "Zone 9") {
        selectedElement = 2;
    }

    if (currentScene == "Zone 10") {
        selectedElement = 0;
    }

    for (let index = 0; index < listCount; index++) {
        var listItem = document.getElementById("mobile-min-text" + (index + 1));

        listItem.style.color = '#cccccc';
        listItem.style.fontWeight = "normal";
        if (index == selectedElement) {
            listItem.style.color = '#dd0000';
            listItem.style.fontWeight = "bold";
        }
    }
}
