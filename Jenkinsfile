pipeline {
  agent any

  options {
    timestamps()
    disableConcurrentBuilds()
  }

  triggers {
    githubPush()
  }

  parameters {
    string(name: 'AWS_REGION', defaultValue: 'us-east-1', description: 'AWS region')
    string(name: 'ECR_REPOSITORY', defaultValue: 'appointmentservice', description: 'ECR repository name')
    string(name: 'ECS_CLUSTER', defaultValue: 'hospital-management-prod-cluster', description: 'ECS cluster name')
    string(name: 'ECS_SERVICE', defaultValue: 'appointment-service', description: 'ECS service name')
    string(name: 'SONAR_PROJECT_KEY', defaultValue: 'appointment-service', description: 'SonarQube project key')
    string(name: 'SONAR_PROJECT_NAME', defaultValue: 'appointment-service', description: 'SonarQube project name')
  }

  environment {
    IMAGE_TAG = "${BUILD_NUMBER}-${GIT_COMMIT}"
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
        sh 'mkdir -p reports'
      }
    }

    stage('Install') {
      steps {
        sh 'npm install'
      }
    }

    stage('Lint') {
      steps {
        sh 'npm run lint'
      }
    }

    stage('Test') {
      steps {
        sh 'npm test -- --ci'
      }
      post {
        always {
          junit allowEmptyResults: true, testResults: 'reports/junit.xml'
        }
      }
    }

    stage('SonarQube Scan') {
      steps {
        withSonarQubeEnv('sonarqube') {
          sh '''
            sonar-scanner \
              -Dsonar.projectKey=${SONAR_PROJECT_KEY} \
              -Dsonar.projectName=${SONAR_PROJECT_NAME} \
              -Dsonar.sources=src \
              -Dsonar.tests=tests \
              -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info
          '''
        }
      }
    }

    stage('Quality Gate') {
      steps {
        timeout(time: 2, unit: 'MINUTES') {
          waitForQualityGate abortPipeline: false
        }
      }
    }

    stage('Checkov') {
      steps {
        sh '''
          checkov -d . --framework dockerfile,secrets --quiet \
            | tee reports/checkov.txt
        '''
      }
    }

    stage('Trivy Filesystem Scan') {
      steps {
        sh '''
          trivy fs . \
            --severity HIGH,CRITICAL \
            --exit-code 1 \
            --format table \
            --output reports/trivy-fs.txt
        '''
      }
    }

    stage('Docker Build') {
      when {
        branch 'main'
      }
      steps {
        sh '''
          SHORT_SHA=$(echo "${GIT_COMMIT}" | cut -c1-7)
          IMAGE_TAG="${BUILD_NUMBER}-${SHORT_SHA}"
          echo "${IMAGE_TAG}" > reports/image_tag.txt
          docker build -t ${ECR_REPOSITORY}:${IMAGE_TAG} -t ${ECR_REPOSITORY}:latest .
        '''
      }
    }

    stage('Trivy Image Scan') {
      when {
        branch 'main'
      }
      steps {
        sh '''
          SHORT_SHA=$(echo "${GIT_COMMIT}" | cut -c1-7)
          IMAGE_TAG="${BUILD_NUMBER}-${SHORT_SHA}"
          trivy image ${ECR_REPOSITORY}:${IMAGE_TAG} \
            --severity HIGH,CRITICAL \
            --exit-code 1 \
            --format table \
            --output reports/trivy-image.txt
        '''
      }
    }

    stage('Push To ECR') {
      when {
        branch 'main'
      }
      steps {
        withCredentials([[
          $class: 'AmazonWebServicesCredentialsBinding',
          credentialsId: 'aws-jenkins'
        ]]) {
          sh '''
            AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
            SHORT_SHA=$(echo "${GIT_COMMIT}" | cut -c1-7)
            IMAGE_TAG="${BUILD_NUMBER}-${SHORT_SHA}"
            ECR_URI="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPOSITORY}"

            aws ecr get-login-password --region ${AWS_REGION} | \
              docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com

            docker tag ${ECR_REPOSITORY}:${IMAGE_TAG} ${ECR_URI}:${IMAGE_TAG}
            docker tag ${ECR_REPOSITORY}:latest ${ECR_URI}:latest
            docker push ${ECR_URI}:${IMAGE_TAG}
            docker push ${ECR_URI}:latest
          '''
        }
      }
    }

    stage('Deploy To ECS Fargate') {
      when {
        branch 'main'
      }
      steps {
        withCredentials([[
          $class: 'AmazonWebServicesCredentialsBinding',
          credentialsId: 'aws-jenkins'
        ]]) {
          sh '''
            aws ecs update-service \
              --cluster ${ECS_CLUSTER} \
              --service ${ECS_SERVICE} \
              --force-new-deployment \
              --region ${AWS_REGION}

            aws ecs wait services-stable \
              --cluster ${ECS_CLUSTER} \
              --services ${ECS_SERVICE} \
              --region ${AWS_REGION}
          '''
        }
      }
    }
  }

  post {
    always {
      archiveArtifacts allowEmptyArchive: true, artifacts: 'reports/*,coverage/**'
      cleanWs()
    }
  }
}
