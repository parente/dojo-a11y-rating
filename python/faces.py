"""
Stripped-down version of the face recognition example by Olivier Grisel

http://scikit-learn.org/dev/auto_examples/applications/face_recognition.html

## original shape of images: 50, 37
"""
import numpy as np
import matplotlib.pyplot as pl
import warnings
warnings.simplefilter("ignore")
from scikits.learn import cross_val, datasets, decomposition, svm

def main():

	# load face data
	lfw_people = datasets.fetch_lfw_people(min_faces_per_person=10, resize=0.4)
	# get random permutation of face indices
	perm = np.random.permutation(lfw_people.target.size)
	# get face data
	lfw_people.data = lfw_people.data[perm]
	print lfw_people.data.shape
	# get person ids
	lfw_people.target = lfw_people.target[perm]
	print lfw_people.target.shape
	# ???
	faces = np.reshape(lfw_people.data, (lfw_people.target.shape[0], -1))
	# create training and test sets, once
	train, test = iter(cross_val.StratifiedKFold(lfw_people.target, k=4)).next()
	# training and test data
	X_train, X_test = faces[train], faces[test]
	# training and test classifications (i.e., person ids)
	y_train, y_test = lfw_people.target[train], lfw_people.target[test]
	print 'Training instances:', y_train.shape
	print 'Test instances:', y_test.shape
	print 'Unique faces:', lfw_people.target_names.shape

	# ..
	# .. dimension reduction ..
	pca = decomposition.RandomizedPCA(n_components=150, whiten=True)
	print 'Doing PCA'
	pca.fit(X_train)
	X_train_pca = pca.transform(X_train)
	X_test_pca = pca.transform(X_test)

	# ..
	# .. classification ..
	clf = svm.SVC(C=5., gamma=0.001)
	print 'Training SVM'
	clf.fit(X_train_pca, y_train)

	# ..
	# .. predict on new images ..
	total = 0
	print 'Apply to test data'
	for i in range(y_test.shape[0]):
		predicted_id = clf.predict(X_test_pca[i])[0]
		actual_id = y_test[i]
		correct = (predicted_id == actual_id)
		total += correct
		# if correct:
		# 	print 'Correct:', lfw_people.target_names[predicted_id]
		# else:
		# 	print 'Incorrect:', lfw_people.target_names[predicted_id], '!=', lfw_people.target_names[y_test[i]]
	    # _ = pl.imshow(X_test[i].reshape(50, 37), cmap=pl.cm.gray)
	    # pl.show()
	print 'Total correct:', total
	print 'Accuracy:', total / float(y_test.shape[0])

if __name__ == '__main__':
	main()