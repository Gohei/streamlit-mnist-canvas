from setuptools import setup, find_packages

setup(
    name="streamlit_mnist_canvas",
    version="0.1.0",
    author="Gohei Kusumi",
    author_email="gohei.kusumi@gmail.com",
    description="A Streamlit component tailored for handwriting digit recognition using the MNIST dataset. This component allows users to draw digits on a canvas, facilitating integration with various machine learning models for digit recognition. It's ideal for educational, development, and testing purposes within Streamlit applications.",
    long_description=open("README.md").read(),
    long_description_content_type="text/markdown",
    url="https://github.com/Gohei/streamlit_mnist_canvas",
    packages=find_packages(),
    include_package_data=True,
    classifiers=[
        "Programming Language :: Python :: 3",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
    ],
    python_requires=">=3.9",
)
