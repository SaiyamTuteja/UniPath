import { useEffect, useState } from "react";
import { HiDownload } from "react-icons/hi";
import { Toaster, toast } from "react-hot-toast";
import logo from "./assets/images/logo.png";
import gif from "./assets/images/screenshots/UniPath.jpeg";
import { serverlink } from "./utils/constant";

const QRGenerator = () => {
    const [sendButtonFreeze, setSendButtonFreeze] = useState(true);
    const [timer, setTimer] = useState(300); // 300 seconds timer

    useEffect(() => {
        let interval;
        if (sendButtonFreeze && timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        } else if (timer === 0) {
            setSendButtonFreeze(false);
        }
        return () => clearInterval(interval);
    }, [sendButtonFreeze, timer]);

    const generateqrpdf = async () => {
        setSendButtonFreeze(true);
        setTimer(300); // Reset timer to 60 seconds
        console.log("Generating QR Code PDF...");
        let roomdata = JSON.parse(localStorage.getItem("roomstatus_infocache"));
        if (!roomdata || roomdata.length === 0) {
            toast.error("No room data found. Please ensure you have room data available.");
            window.location.replace("/");
            return;
        }
        for (let i = 0; i < roomdata.length; i++) {
            roomdata[i].schedule = {};
        }
        try {
            const response = await fetch(`${serverlink}/generateqrpdf`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ roomdata: roomdata })
            });
            console.log("Fetching PDF from server...");
            console.log(response)
            if (!response.ok) {
                throw new Error("Failed to fetch PDF");
            }
            console.log("PDF generated successfully! 1");
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);

            // Create a download link
            const a = document.createElement('a');
            a.href = url;
            a.download = 'RoomPosters.pdf';
            document.body.appendChild(a);
            a.click();
            a.remove();
            console.log("PDF generated successfully! 1.5");

            window.URL.revokeObjectURL(url); // Clean up

            console.log("PDF download triggered!");
        } catch (error) {
            setTimer(20)
            console.error('PDF generation failed:', error);
        }
    };

    return (
        <div className="flex flex-col w-full h-screen lg:flex-row">
            <Toaster />
            <div className="relative hidden lg:block lg:w-3/5">
                <img src={gif} className="object-contain w-full h-full p-20 " alt="Cover Photo" />
            </div>
            <div className="flex items-center justify-center flex-grow p-6 bg-white rounded-l-3xl">
                <div className="w-full max-w-md">
                    <div className="flex justify-center mb-6">
                        <img
                            onClick={() => window.location.replace("/")}
                            className="w-40 h-40 hover:cursor-pointer"
                            src={logo}
                            alt=""
                        />
                    </div>
                    <div className="space-y-5">
                        <h2 className="my-2 text-2xl font-bold text-center">Download QR Codes</h2>
                        <ol className="text-base list-disc">
                            <h1 className="mb-3 text-lg font-semibold text-center">
                                Read the points before downloading
                            </h1>
                            <li>
                                QR codes are designed to be scanned by the
                                <span className="font-bold"> QR Code Scanner</span> in the
                                <span className="font-bold"> UniPath app</span>.
                            </li>
                            <li>
                                These QR Codes are to be pasted outside every room.
                            </li>
                            <li>
                                The QR Codes are also used to promote<span className="font-bold"> UniPath</span>.
                            </li>
                            <li>
                                These QR Codes are also used for quick source selection.
                            </li>
                        </ol>
                        <div className="space-y-4">
                            <button
                                disabled={sendButtonFreeze}
                                className={`flex w-full justify-center items-center hover:bg-primary-dark py-3 px-4 rounded-full gap-2 text-white font-bold
                                        ${sendButtonFreeze ? "cursor-not-allowed bg-gray-500" :
                                        "bg-primary hover:bg-primary-dark"}`}
                                onClick={generateqrpdf}
                            >
                                <HiDownload className="w-5 h-5" />
                                <span>{sendButtonFreeze ? `Download in ${timer}s` : "Download"}</span>
                            </button>
                        </div>
                        <div className="flex items-center justify-center w-full gap-1 text-center text-md">
                            <span>Don’t Want to Download ?</span>
                            <a href="/">
                                <span className="font-bold text-primary"> Go Back</span>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default QRGenerator;