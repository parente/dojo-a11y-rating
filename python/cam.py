import cv
import os

HAAR_DIR = '/usr/local/share/OpenCV/haarcascades/'
HAAR_FACE = os.path.join(HAAR_DIR, 'haarcascade_frontalface_alt2.xml')
HAAR_GLASSES = os.path.join(HAAR_DIR, 'haarcascade_eye_tree_eyeglasses.xml')
HAAR_EYES = os.path.join(HAAR_DIR, 'haarcascade_mcs_eyepair_small.xml')
HAAR_NOSE = os.path.join(HAAR_DIR, 'haarcascade_mcs_nose.xml')
HAAR_LEFT_EYE = os.path.join(HAAR_DIR, 'haarcascade_lefteye_2splits.xml')
WEBCAM_NAME = 'Webcam'
EIG_NAME = 'Eigenvalues'
WIDTH = 640
HEIGHT = 480

# camera capture
capture = cv.CaptureFromCAM(-1)

# haar cascades
face_cascade = cv.Load(HAAR_FACE)

# create a window for display
cv.NamedWindow(WEBCAM_NAME, cv.CV_WINDOW_AUTOSIZE)
cv.MoveWindow(WEBCAM_NAME, 0, 0)
# cv.NamedWindow(EIG_NAME, cv.CV_WINDOW_AUTOSIZE)
# cv.MoveWindow(EIG_NAME, 400, 0)

cv.SetCaptureProperty(capture, cv.CV_CAP_PROP_FRAME_WIDTH, WIDTH)
cv.SetCaptureProperty(capture, cv.CV_CAP_PROP_FRAME_HEIGHT, HEIGHT)

box_color = cv.RGB(255, 110, 10)
haar_mem = cv.CreateMemStorage(0)
# won't ever need more than full image size
eig_img = cv.CreateImage((WIDTH, HEIGHT), cv.IPL_DEPTH_32F, 1)
tmp_img = cv.CreateImage((WIDTH, HEIGHT), cv.IPL_DEPTH_32F, 1)

# camera capture / display loop
while 1:
    frame = cv.QueryFrame(capture)
    
    # detect head
    regions = cv.HaarDetectObjects(frame, face_cascade, haar_mem, 
        1.2, # scale factor between scans
        2, # minimum number of neighbors rects, or -1 to leave ungrouped
        cv.CV_HAAR_DO_CANNY_PRUNING, 
        (150, 150) # minimum window size
    )

    if len(regions):
        # get head rect
        region = regions[0][0]
        head = cv.GetSubRect(frame, region)

        # create grayscale sized to head bounding box
        gray_img = cv.CreateImage((region[2], region[3]), cv.IPL_DEPTH_8U, 1)
        cv.CvtColor(head, gray_img, cv.CV_RGB2GRAY)

        # detect corners
        corners = cv.GoodFeaturesToTrack(gray_img, eig_img, tmp_img,
            300, # number of corners
            0.04, # minimum corner quality
            2.0, # minimum distance between corners
            useHarris = False
        )

        # box around regions
        for (x,y,w,h),n in regions:
            cv.Rectangle(frame, (x,y), (x+w,y+h), box_color)

        # box around corners
        x,y,w,h = region
        for cx,cy in corners:
            cx, cy = x+int(cx), y+int(cy)
            cv.Rectangle(frame, (cx-1,cy-1), (cx+1,cy+1), box_color)

        # cv.ShowImage(EIG_NAME, eig_img)
    cv.ShowImage(WEBCAM_NAME, frame)
    if cv.WaitKey(10) == 27:
        break

# cleanup
cv.DestroyAllWindows()